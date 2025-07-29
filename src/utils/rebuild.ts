import { Tag } from '../types/index.interface';

const TAG_NAME_REGEX = /<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)\b/;  // 获取开始或结束标签的名
const SINGLE_TAG_REGEX = /<([^\s>]+)/;  // 单标签
const TAG_REGEX = /<\/?[a-z]+[^>]*>|[^<>]+/gi;  // 开始和结束标签
const $FOR_REGEX = /r-for\s*=\s*"([^"]+)"/;  //$for 属性值
const $IF_REGEX = /r-if\s*=\s*"([^"]+)"/;  //$if 属性值
const $STYLE_REGEX = /r-style\s*=\s*"([^"]+)"/;  //$style 属性值
const $CLASS_REGEX = /r-class\s*=\s*"([^"]+)"/;  //$class 属性值
const $ATTRS_REGEX = /\sr-[a-z]\w+\s*=\s*"[^"]*"/g;  // 所有$符号的属性
const $CONTENT_REGEX = /\{\{(.+?)\}\}/g;  // $符号内容
const RELATIONAL_SYMBOLS_REGEX = /<=|>=|\=+|>|</;  // 关系符号
const STR_REGEX = /^("|'|`)(.*)\1$/;
const CALLBACK_REGEX = /\s*setContent\((.*?)\)\s*/g;
const FUN_NAME_REGEX = /([a-zA-Z_$][a-zA-Z0-9_$]*)/;

function useId() {
    return Math.random().toString(36).substring(2, 15)
}

function hasSingleTag(tag: string) {
    return ['img', 'br', 'input'].includes(tag.match(SINGLE_TAG_REGEX)?.[1] as string);
}

function findStartTag(currentIndex: number, tags: any[]) {
    let index = 1;
    let prevTag = tags[currentIndex - index];
    const currentTag = tags[currentIndex];
    const currentTagName = currentTag.tag?.match(TAG_NAME_REGEX)?.[1];
    let prevTagName;

    while (currentTagName !== prevTagName) {
        prevTag = tags[currentIndex - index] || prevTag;
        prevTagName = prevTag.tag?.match(TAG_NAME_REGEX)?.[1];
        index++;
    }

    return prevTag
}

function operatorsParse(content = '') {
    return content.replace('&gt;', '>').replace('&lt;', '<').replaceAll('&amp;', '&')
}

function resolver(htmlStr: string) {
    const tags = [];
    let match;
    let index = 0;
    let annotation = false;

    htmlStr = htmlStr.replace('<!--', '<annotation>').replace('-->', '</annotation>');

    while ((match = TAG_REGEX.exec(htmlStr)) !== null) {
        const tag = match[0].trim();

        if (!tag) continue;

        if (tag.startsWith('</')) {
            const item: Tag = {
                type: 'node',
                tag,
            };

            if (annotation) item.$disabledFor = true;
            if (item?.tag?.includes('</annotation>')) annotation = false;

            tags.push(item);

            const prevTag = findStartTag(index, tags);
            prevTag.endIndex = index;

        } else if (tag.startsWith('<')) {
            const forMatch = tag.match($FOR_REGEX)?.[1];
            const ifMatch = tag.match($IF_REGEX)?.[1];
            const styleMatch = tag.match($STYLE_REGEX)?.[1];
            const classMatch = tag.match($CLASS_REGEX)?.[1];
            const item: Tag = {
                type: 'node',
                tag: tag.replace($ATTRS_REGEX, '')
            };

            if (forMatch) item.$for = forMatch;
            if (ifMatch) item.$if = operatorsParse(ifMatch);
            if (styleMatch) item.$style = operatorsParse(styleMatch);
            if (classMatch) item.$class = operatorsParse(classMatch);

            if (item?.tag?.includes('<annotation>')) annotation = true;
            if (annotation) item.$disabledFor = true;

            tags.push(item);
        } else {
            tags.push({
                type: 'content',
                content: tag,
            });
        }

        index++;
    }

    return tags;
}

function callbackParse(content = '') {
    return content.replace(CALLBACK_REGEX, (_match, args) => {
        const newArgs = args.split(',').map((arg: string) => {
            if (STR_REGEX.test(arg.trim())) return arg
            return 'this.' + arg.trim()
        });
        const funName = content.match(FUN_NAME_REGEX)?.[0];

        return `${funName}(${newArgs})`
    });
}

function contentParse(content = '') {
    return content.replace($CONTENT_REGEX, (_match, key) => {
        const newKey = callbackParse(key);
        return '${this.' + newKey + '}'
    });
}

function parseIf(ifContent: string) {
    ifContent = ifContent.replace(/^\s*if\s*=\s*/, '');

    const operator = ifContent.match(RELATIONAL_SYMBOLS_REGEX);
    const [left, right] = ifContent.split(RELATIONAL_SYMBOLS_REGEX);
    let leftVariable = (STR_REGEX.test(left.trim()) || /\d/.test(left.trim())) ? left.trim() : `this.${left.trim()}`;
    let rightVariable = (STR_REGEX.test(right.trim()) || /\d/.test(right.trim())) ? right.trim() : `this.${right.trim()}`;

    let code = '';
    code += `if(`;
    code += `${leftVariable}`;
    code += `${operator}`;
    code += `${rightVariable}`;
    code += `) {\n`;

    return code;
}

function styleParse(styleContent: string) {
    const styleValue = contentParse(styleContent.match($CONTENT_REGEX)?.[0]);
    
    return styleContent.replace($CONTENT_REGEX, styleValue)
}

function classParse(classContent = '') {
    const classValue = contentParse(classContent.match($CONTENT_REGEX)?.[0]);

    return classContent.replace($CONTENT_REGEX, classValue)
}

function attributeParse(tagData: Record<string, any>) {
    const tag = tagData.tag;
    const styleValue = styleParse(tagData.$style || '');
    const classValue = classParse(tagData.$class || '');
    let _style = styleValue ? ' style="' + styleValue + '"' : '';
    let _class = classValue ? ' class="' + classValue + '"' : '';

    return tag.replace('>', _style + _class + '>');
}

function parseFor(forContent: string) {
    const expressionFor = forContent.split(/\s(in)\s/);
    const iterable = expressionFor[expressionFor.length - 1];
    const expressionLeft = expressionFor[0].split(',');
    const itemKey = expressionLeft[0];
    const indexKey = expressionLeft[1];
    let code = '';

    code += `for(let i = 0;i < this?.${iterable}?.length; i++) {\n`;
    code += `this.${itemKey} = this.${iterable}[i];\n`;

    if (indexKey) code += `this.${indexKey} = i;\n`;

    return code
}

function compose(tags: Record<string, any>[]) {
    let code = '';

    for (let t of tags) {
        const { type, content } = t;

        if (type === 'node') {
            if (t.$if) {
                code += parseIf(t.$if);
                tags[t.endIndex].isIf = true;
            }

            if (t.$for && !t.$disabledFor) {
                code += parseFor(t.$for);
                if (hasSingleTag(t.tag)) t.isFor = true
                else tags[t.endIndex].isFor = true;
            }

            if (t.$style || t.$class) {
                t.tag = attributeParse(t)
            }

            code += 'html +=`' + t.tag + '`;\n';

            if (t.isFor) code += '}\n';
            if (t.isIf) code += '}\n';
        } else {
            code += 'html +=`' + contentParse(content) + '`;\n';
        }
    }

    return code;
}

// 解析模板
// 1. 解析标签
// 2. 替换内容
// 3. 返回渲染结果
// 4. 处理循环和条件
// 5. 返回最终的HTML字符串
// 6. 支持嵌套标签
// 7. 支持条件渲染
// 8. 支持循环渲染
// 9. 支持数据绑定
// 10. 支持内嵌样式绑定
// 11. 支持类绑定
function render(html: string, context = {}) {
    if (!Reflect.ownKeys(context).length) return ''

    const tags = resolver(html);
    const code = compose(tags)
        .replaceAll('<annotation>', '<!--')
        .replaceAll('</annotation>', '-->');

    const renderedContent = new Function(
        `
                let html = ''\n;
                ${code}
                return html;\n
            `
    );

    return renderedContent.call(context);
}

function replaceElementWithPlaceholder(el: Element, placeholderText = 'PLACEHOLDER') {
    const comment = document.createComment(placeholderText);
    
    el.replaceWith(comment);
    return comment; // 可以用于恢复
}

function rebuild(selector: string, context: Record<string, any>) {
    const element = document.querySelector(selector);
    if (!element) return

    const outerHTML = element.outerHTML;

    element.setAttribute('hidden', 'true');

    const id = useId();
    replaceElementWithPlaceholder(element, id);

    const newHtml = render(outerHTML, context);

    document.body.innerHTML = document.body.innerHTML.replace(`<!--${id}-->`, newHtml);
    element.setAttribute('hidden', 'false');
}

window.s = {
    rebuild,
    render
};
