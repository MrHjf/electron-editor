import React, {Component} from 'react';
import {Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, CompositeDecorator, Modifier} from 'draft-js'
import './draft.css';
import {Dropdown, Menu, Icon, Tooltip, Modal, Button, Input} from 'antd';

export default class RichEditorExample extends Component {
    constructor(props) {
        super(props);
        const decorator = new CompositeDecorator([
            {
                strategy: findLinkEntities,
                component: Link,
            },
        ]);
        this.state = {editorState: EditorState.createEmpty(decorator)};
        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => {
            console.log(editorState);
            this.setState({editorState});
        }
        this.handleKeyCommand = this._handleKeyCommand.bind(this);
        this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
        this.toggleBlockType = this._toggleBlockType.bind(this);
        this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    }

    handleEditorState = (newEditorState) => {
        this.setState({
            editorState: newEditorState
        })
    }

    _handleKeyCommand(command, editorState) {
        console.log(command, editorState);
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }
    _mapKeyToEditorCommand(e) {
        console.log(e.keyCode);
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(
                e,
                this.state.editorState,
                4, /* maxDepth */
            );
            if (newEditorState !== this.state.editorState) {
                this.onChange(newEditorState);
            }
            return;
        }
        return getDefaultKeyBinding(e);
    }
    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }
    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    consoleLog = () => {
        const content = this.state.editorState.getCurrentContent();
        console.log(convertToRaw(content));
    }

    render() {
        const {editorState} = this.state;
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        this.consoleLog();

        return (
            <div className="RichEditor-root">
                <MenuControl
                    editorState={editorState}
                    onBlockToggle={this.toggleBlockType}
                    onInlineBlock={this.toggleInlineStyle}
                    handleEditorState={this.handleEditorState}
                />
                <div className={className} onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.mapKeyToEditorCommand}
                        onChange={this.onChange}
                        placeholder="Tell a story..."
                        ref="editor"
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }
}
// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};
function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}
class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }
    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }
        return (
            <Tooltip title={this.props.toolTip || 'toolTip'}>
                <span className={className} onMouseDown={this.onToggle}>
                  {this.props.label}
                </span>
            </Tooltip>
        );
    }
}

class StyleSelect extends Component {

    renderMenu = () => {
        const {config, blockType, onToggle} = this.props;
        return (
            <Menu>
                {config.options.map((type, index)=> (
                    <Menu.Item key={index}>
                        <StyleButton
                            key={type.label}
                            active={type.style === blockType}
                            label={type.label}
                            onToggle={onToggle}
                            style={type.style}
                        />
                    </Menu.Item>))
                }
            </Menu>
        )
    };

    render() {
        const {config, blockType} = this.props;
        const active = config.options.map(item => item.style).includes(blockType);
        let className = 'RichEditor-styleButton';
        if (active) {
            className += ' RichEditor-activeButton';
        }
        return (
            <Dropdown overlay={this.renderMenu()} placement="bottomLeft">
                <Tooltip title={config.toolTip || 'toolTip'}>
                    <span className={className}>{config.label}</span>
                </Tooltip>
            </Dropdown>
        );
    }
}

class MenuControl extends Component{

    state= {
        linkVisible: false,
        picVisible: false,
        urlValue: '',
        url: '',
    }

    handleLinkOk = (e, urlValue, url) => {
        e.preventDefault();
        const {editorState, handleEditorState} = this.props;

        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'LINK',
            'MUTABLE',
            {url: url}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        if (urlValue) {
            const newContentState = Modifier.replaceText(contentState, editorState.getSelection(), urlValue, null,
                entityKey);
            const newEditorState = EditorState.push(editorState, newContentState, 'LINK');
            handleEditorState(newEditorState);
        } else {
            const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
            handleEditorState(RichUtils.toggleLink(
                newEditorState,
                newEditorState.getSelection(),
                entityKey
            ));
        }
    }

    getMenuConfig = () => {
        const self = this;
        return [
            {
                label: 'H',
                type: 'select',
                toolTip: '标题',
                options: [
                    {label: 'H1', style: 'header-one'},
                    {label: 'H2', style: 'header-two'},
                    {label: 'H3', style: 'header-three'},
                    {label: 'H4', style: 'header-four'},
                    {label: 'H5', style: 'header-five'},
                    {label: 'H6', style: 'header-six'},
                ]
            },
            {label: 'B', toolTip: '字体加粗 ctrl + b', display: 'inline', style: 'BOLD'},
            {label: 'I', toolTip: '斜体 ctrl + i', display: 'inline', style: 'ITALIC'},
            {label: 'U', toolTip: '下划线 ctrl + u', display: 'inline', style: 'UNDERLINE'},
            {label: 'M', display: 'inline', style: 'CODE'},
            {label: '”', style: 'blockquote'},
            {label: <Icon type="profile" />, toolTip: '无序列表', style: 'unordered-list-item'},
            {label: <Icon type="profile" />, toolTip: '有序列表', style: 'ordered-list-item'},
            {label: '</>', style: 'code-block'},
            {
                label: <Icon type='link'/>,
                toolTip: '插入链接',
                type: 'link',
                style: 'linkVisible',
                onToggle: (key) => {
                    self.getSelectedText('urlValue');
                    self.showModal(key);
                }
            },
            {label: <Icon type='picture' />, toolTip: '上传图片', type: 'upload-pic'}
        ];
    }

    showModal = (key) => {
        const state = {};
        state[key] = !this.state[key];
        this.setState(state);
    }

    getSelectedText = (key) => {
        const {editorState} = this.props;

        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();

        const anchorKey = selectionState.getAnchorKey();
        const startKey = selectionState.getStartKey();
        const start = selectionState.getStartOffset();
        const end = selectionState.getEndOffset();

        const currentContentBlock = contentState.getBlockForKey(anchorKey);
        const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
        const linkKey = blockWithLinkAtBeginning.getEntityAt(start);
        const selectedText = currentContentBlock.getText().slice(start, end);

        let url = '';

        if (linkKey) {
            const linkInstance = contentState.getEntity(linkKey);
            url = linkInstance.getData().url;
        }

        if (key) {
            const state = {};
            state[key] = selectedText;
            state.url = url;
            this.setState(state);
        }
        return selectedText;
    }

    renderComponent = (type, index) => {

        const {editorState, onBlockToggle, onInlineBlock} = this.props;
        const inline = type.display === 'inline';

        const selection = editorState.getSelection();
        const blockType = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();
        const currentStyle = editorState.getCurrentInlineStyle();

        const active = inline ? currentStyle.has(type.style) : type.style === blockType;
        const onToggle = type.onToggle ? type.onToggle : (inline ? onInlineBlock : onBlockToggle);

        if (type.type === 'select') {
            return (<StyleSelect key={index} config={type} blockType={blockType} onToggle={onToggle}/>);
        }

        return (<StyleButton
            key={index}
            active={active}
            label={type.label}
            onToggle={onToggle}
            style={type.style}
            toolTip={type.toolTip}
        />)
    }

    render(){
        const {linkVisible, picVisible, urlValue, url} = this.state;
        return (
            <div className="RichEditor-controls">
                {this.getMenuConfig().map((type, index) =>
                    this.renderComponent(type, index)
                )}
                {linkVisible && <LinkModal defaultValue={{urlValue, url}} visible={linkVisible} showModal={this.showModal} handleOk={this.handleLinkOk}/>}
                {picVisible}
            </div>
        )
    }
}

class LinkModal extends Component {

    state={
        urlValue: '',
        url: '',
    }

    handleOk = (e) => {
        const {urlValue, url} = this.state;
        this.props.handleOk(e, urlValue, url);
        this.props.showModal('linkVisible');
    }

    handleUrlChange = (e) => {
        this.setState({url: e.target.value});
    }

    handleChange = (e) => {
        this.setState({urlValue: e.target.value});
    }

    render() {
        const {visible, showModal, defaultValue} = this.props;
        return (
            <div>
                <Modal
                    title="插入链接"
                    onCancel={() => showModal('linkVisible')}
                    visible={visible}
                    footer={
                        <div style={{textAlign: 'center'}}>
                            <Button type='default' onClick={() => showModal('linkVisible')}>取消</Button>
                            <Button type='primary' onClick={this.handleOk}>确定</Button>
                        </div>
                    }
                >
                    <Input
                        style={{marginBottom: 10}}
                        placeholder="输入链接文本"
                        ref='urlValue'
                        defaultValue={defaultValue.urlValue}
                        onChange={this.handleChange}
                        prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />
                    <Input
                        placeholder="输入链接地址"
                        ref='url'
                        defaultValue={defaultValue.url}
                        onChange={this.handleUrlChange}
                        prefix={<Icon type="link" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />
                </Modal>
            </div>
        );
    }
}

function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'LINK'
            );
        },
        callback
    );
}

const Link = (props) => {
    const {url} = props.contentState.getEntity(props.entityKey).getData();
    return (
        <a href={url}>
            {props.children}
        </a>
    );
};

// const BlockStyleControls = (props) => {
//
//     const renderComponent = (type) => {
//         if (type.type === 'select') {
//           return (<StyleSelect config={type} blockType={blockType} props={props}/>);
//         }
//         return (<StyleButton
//             key={type.label}
//             active={type.style === blockType}
//             label={type.label}
//             onToggle={props.onToggle}
//             style={type.style}
//         />)
//     }
//
//     const {editorState} = props;
//     const selection = editorState.getSelection();
//     const blockType = editorState
//         .getCurrentContent()
//         .getBlockForKey(selection.getStartKey())
//         .getType();
//
//     return (
//         <span className="RichEditor-controls">
//             {BLOCK_TYPES.map((type) =>
//                 renderComponent(type)
//             )}
//         </span>
//     );
// };
// var INLINE_STYLES = [
//     {label: 'B', style: 'BOLD'},
//     {label: 'Italic', style: 'ITALIC'},
//     {label: 'Underline', style: 'UNDERLINE'},
//     {label: 'Monospace', style: 'CODE'},
// ];
// const InlineStyleControls = (props) => {
//     const currentStyle = props.editorState.getCurrentInlineStyle();
//
//     return (
//         <span className="RichEditor-controls">
//             {INLINE_STYLES.map((type) =>
//                 <StyleButton
//                     key={type.label}
//                     active={currentStyle.has(type.style)}
//                     label={type.label}
//                     onToggle={props.onToggle}
//                     style={type.style}
//                 />
//             )}
//         </span>
//     );
// };
