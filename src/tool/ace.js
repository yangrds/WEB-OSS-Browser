
export function editorInit(codeVal, suffix = '.txt') {
    const { modes } = require('./codeModules')
    let language = null
    let status = 'editor'
    for (let i = 0; i < modes.length; i++) {
        let item = modes[i]
        let temp = new RegExp(item.extRe).test(suffix)
        temp && (language = item)

    }

    if (language === null) {
        codeVal = '不支持的文本编译类型，无法预览。'
        status = 'disable'
        language = {
            caption: "Text",
            extensions: "txt",
            mode: "ace/mode/text",
            name: "text",
        }
    }



    //引入语言工具
    ace.require("ace/ext/language_tools");
    const editor = ace.edit("editor");
    //选择主题
    editor.setTheme("ace/theme/iplastic");
    //选择语言
    editor.getSession().setMode(language.mode)
    //各项设置
    editor.setOptions({
        enableBasicAutoCompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        selectionStyle: "line",
        fontSize: 14,
    });
    // 错误状态，编辑器置为只读
    status === 'disable' && editor.setReadOnly(true)
    editor.setShowPrintMargin(false)
    editor.getSession().setUseWrapMode(true);
    editor.setValue(codeVal, 1)
    return { editor, language, status }
}