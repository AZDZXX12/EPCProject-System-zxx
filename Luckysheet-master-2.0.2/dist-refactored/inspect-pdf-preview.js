// PDF预览页面检查脚本
// 在PDF预览对话框打开后，在Console中运行此脚本

console.log('🔍 开始检查PDF预览页面结构...');

// 1. 检查所有.page-num元素
const pageNums = document.querySelectorAll('.page-num');
console.log(`📊 找到 ${pageNums.length} 个页码元素`);

pageNums.forEach((elem, index) => {
    console.log(`\n=== 页码 ${index + 1} ===`);
    console.log('textContent:', elem.textContent);
    console.log('innerHTML:', elem.innerHTML);
    console.log('outerHTML:', elem.outerHTML);
    
    // 检查子节点
    console.log(`子节点数量: ${elem.childNodes.length}`);
    elem.childNodes.forEach((child, i) => {
        if (child.nodeType === 1) {
            console.log(`  子元素 ${i}:`, child.tagName, child.outerHTML);
        } else if (child.nodeType === 3) {
            console.log(`  文本节点 ${i}:`, JSON.stringify(child.nodeValue));
        }
    });
    
    // 检查伪元素
    const before = window.getComputedStyle(elem, '::before');
    const after = window.getComputedStyle(elem, '::after');
    
    if (before.content !== 'none' && before.content !== '""') {
        console.log('⚠️ 发现::before伪元素:', before.content);
    }
    if (after.content !== 'none' && after.content !== '""') {
        console.log('⚠️ 发现::after伪元素:', after.content);
    }
    
    // 检查兄弟元素
    if (elem.nextSibling) {
        console.log('下一个兄弟节点:', elem.nextSibling);
    }
    if (elem.previousSibling) {
        console.log('上一个兄弟节点:', elem.previousSibling);
    }
});

// 2. 检查preview-page容器
const previewPages = document.querySelectorAll('.preview-page');
console.log(`\n📄 找到 ${previewPages.length} 个预览页面`);

previewPages.forEach((page, index) => {
    console.log(`\n=== 预览页 ${index + 1} ===`);
    console.log('子元素数量:', page.children.length);
    Array.from(page.children).forEach((child, i) => {
        console.log(`  ${i}: <${child.tagName} class="${child.className}">`);
        if (child.className === 'page-num') {
            console.log(`    内容: "${child.textContent}"`);
        }
    });
});

// 3. 检查是否有其他带有页码文本的元素
const allText = document.body.textContent;
const pageRegex = /第\s*\d+\s*页|[0-9]+\s*\/\s*[0-9]+/g;
const matches = allText.match(pageRegex);
if (matches) {
    console.log('\n🔍 在页面中找到的所有页码相关文本:', matches);
}

// 4. 搜索所有包含"页"字的元素
const allElements = document.querySelectorAll('*');
const elementsWithPage = [];
allElements.forEach(elem => {
    if (elem.textContent.includes('页') || elem.textContent.match(/[0-9]+\s*\/\s*/)) {
        if (elem.textContent.length < 50) { // 只显示简短的元素
            elementsWithPage.push({
                tag: elem.tagName,
                className: elem.className,
                text: elem.textContent.trim()
            });
        }
    }
});
console.log('\n📝 包含页码文本的元素:', elementsWithPage);

// 5. 检查水印
console.log('\n💧 检查水印...');
const watermarks = document.querySelectorAll('[style*="position: absolute"][style*="transform"]');
console.log(`找到 ${watermarks.length} 个可能的水印元素`);
watermarks.forEach((elem, i) => {
    if (elem.textContent.length < 20) {
        console.log(`  水印 ${i}: "${elem.textContent}"`);
    }
});

console.log('\n✅ 检查完成！请查看上方输出。');

