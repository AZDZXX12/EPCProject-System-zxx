/**
 * Tabs迁移脚本
 * 将Tabs.TabPane转换为items API
 * 
 * 使用方法：
 * 1. 识别所有Tabs.TabPane
 * 2. 提取tab和key属性
 * 3. 提取children内容
 * 4. 生成items数组
 */

// 这个文件用于文档目的，实际迁移需要手动完成
// 因为JSX内容的复杂性

export const migrationGuide = `
旧API:
<Tabs activeKey={activeTab} onChange={setActiveTab}>
  <Tabs.TabPane tab="标签1" key="tab1">
    内容1
  </Tabs.TabPane>
  <Tabs.TabPane tab="标签2" key="tab2">
    内容2
  </Tabs.TabPane>
</Tabs>

新API:
const tabItems = [
  {
    key: 'tab1',
    label: '标签1',
    children: (
      <>内容1</>
    ),
  },
  {
    key: 'tab2',
    label: '标签2',
    children: (
      <>内容2</>
    ),
  },
];

<Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
`;

console.log(migrationGuide);
