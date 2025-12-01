/**
 * 知识库系统
 * 参考：Worktile
 */

import React, { useState } from 'react';
import { Card, Tree, Input, Button, Space, List, Tag, Typography, Breadcrumb } from 'antd';
import { FileTextOutlined, FolderOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Search } = Input;
const { Paragraph } = Typography;

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createTime: string;
  updateTime: string;
}

const KnowledgeBase: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const treeData: DataNode[] = [
    {
      title: '项目管理',
      key: '0-0',
      icon: <FolderOutlined />,
      children: [
        { title: 'EPC项目流程', key: '0-0-0', icon: <FileTextOutlined /> },
        { title: '质量管理规范', key: '0-0-1', icon: <FileTextOutlined /> },
      ],
    },
    {
      title: '技术文档',
      key: '0-1',
      icon: <FolderOutlined />,
      children: [
        { title: '设备操作手册', key: '0-1-0', icon: <FileTextOutlined /> },
        { title: '施工技术规范', key: '0-1-1', icon: <FileTextOutlined /> },
      ],
    },
  ];

  const documents: Document[] = [
    {
      id: '1',
      title: 'EPC项目管理流程',
      content: '详细的EPC项目管理流程说明...',
      category: '项目管理',
      tags: ['EPC', '流程', '管理'],
      createTime: '2025-01-01',
      updateTime: '2025-11-20',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
      <Card style={{ width: 280, overflow: 'auto' }} bodyStyle={{ padding: 12 }}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
          <Search placeholder="搜索文档" />
          <Button type="primary" icon={<PlusOutlined />} block>
            新建文档
          </Button>
        </Space>
        <Tree
          showIcon
          defaultExpandAll
          treeData={treeData}
          onSelect={(keys) => console.log('selected', keys)}
        />
      </Card>

      <Card style={{ flex: 1, overflow: 'auto' }}>
        {selectedDoc ? (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>{selectedDoc.title}</h2>
                <Space>
                  {selectedDoc.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
              <Space>
                <Button icon={<EditOutlined />}>编辑</Button>
                <Button icon={<DeleteOutlined />} danger>
                  删除
                </Button>
              </Space>
            </div>
            <Paragraph>{selectedDoc.content}</Paragraph>
            <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
              创建时间：{selectedDoc.createTime} | 更新时间：{selectedDoc.updateTime}
            </div>
          </>
        ) : (
          <List
            dataSource={documents}
            renderItem={(item) => (
              <List.Item
                actions={[<Button type="link">查看</Button>]}
                onClick={() => setSelectedDoc(item)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                  title={item.title}
                  description={
                    <Space>
                      <Tag>{item.category}</Tag>
                      {item.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default KnowledgeBase;
