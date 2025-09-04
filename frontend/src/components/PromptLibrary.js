import React, { useState } from 'react';
import { Modal, Button, List, Typography, Input, message, Divider, Card } from 'antd';
import { BookOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PromptLibrary = ({ prompts, onUpdate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddPrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      message.warning('请输入提示词名称和内容');
      return;
    }

    setAdding(true);
    try {
      await axios.post('/api/prompts', {
        name: newPromptName.trim(),
        prompt: newPromptContent.trim()
      });
      
      message.success('提示词添加成功！');
      setNewPromptName('');
      setNewPromptContent('');
      onUpdate();
    } catch (error) {
      message.error(error.response?.data?.detail || '添加提示词失败');
    } finally {
      setAdding(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  const promptCategories = {
    '商品展示': prompts.filter(p => p.name.includes('商品展示')),
    '时尚服饰': prompts.filter(p => p.name.includes('时尚') || p.name.includes('服饰')),
    '电子产品': prompts.filter(p => p.name.includes('电子')),
    '其他': prompts.filter(p => 
      !p.name.includes('商品展示') && 
      !p.name.includes('时尚') && 
      !p.name.includes('服饰') && 
      !p.name.includes('电子')
    )
  };

  return (
    <>
      <Button
        icon={<BookOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ 
          color: 'white', 
          borderColor: 'rgba(255,255,255,0.5)',
          backgroundColor: 'rgba(255,255,255,0.1)'
        }}
        ghost
      >
        提示词库
      </Button>
      
      <Modal
        title={
          <div>
            <BookOutlined style={{ marginRight: 8 }} />
            提示词库管理
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 添加新提示词 */}
          <Card title="添加新提示词" style={{ marginBottom: 24 }}>
            <Input
              placeholder="提示词名称（如：商品展示-旋转效果）"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <TextArea
              placeholder="提示词内容（如：产品缓慢旋转360度，展示各个角度的细节，背景保持简洁，光线柔和均匀）"
              rows={3}
              value={newPromptContent}
              onChange={(e) => setNewPromptContent(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              loading={adding}
              onClick={handleAddPrompt}
            >
              添加提示词
            </Button>
          </Card>

          {/* 提示词分类展示 */}
          {Object.entries(promptCategories).map(([category, categoryPrompts]) => {
            if (categoryPrompts.length === 0) return null;
            
            return (
              <div key={category} style={{ marginBottom: 24 }}>
                <Title level={5}>{category}</Title>
                <List
                  size="small"
                  bordered
                  dataSource={categoryPrompts}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(item.prompt)}
                        >
                          复制
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Text strong style={{ color: '#667eea' }}>
                            {item.name}
                          </Text>
                        }
                        description={
                          <Text style={{ fontSize: '13px' }}>
                            {item.prompt}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            );
          })}

          {prompts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <BookOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>暂无提示词，请添加一些常用的视频生成提示词</div>
            </div>
          )}

          <Divider />
          
          <div style={{ background: '#f6f8fa', padding: 16, borderRadius: 8 }}>
            <Title level={5}>使用建议</Title>
            <ul style={{ marginBottom: 0, fontSize: '13px' }}>
              <li>提示词应该具体描述期望的视频效果</li>
              <li>可以包含动作、角度、光线、背景等元素</li>
              <li>建议按商品类型分类管理提示词</li>
              <li>好的提示词能显著提升视频生成质量</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PromptLibrary;