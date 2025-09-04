import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, message, Input, Select, Modal, List } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VideoGenerate = ({ startImage, endImage, services, prompts, onGenerate, onBack, onPromptUpdate }) => {
  // 默认选择首尾帧生视频服务
  const [selectedService, setSelectedService] = useState('kling_image2video_v1');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  // 默认使用商品展示旋转效果提示词
  const [prompt, setPrompt] = useState('产品缓慢旋转360度，展示各个角度的细节，背景保持简洁，光线柔和均匀');
  // 默认选择Kling V2.1模型（与服务配置保持一致）
  const [model, setModel] = useState('kling-v2-1');
  const [generating, setGenerating] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  // 当选择服务时，自动从服务配置中读取API key和默认模型
  useEffect(() => {
    if (selectedService && services) {
      const service = services.find(s => s.id === selectedService);
      if (service) {
        setAccessKey(service.access_key || '');
        setSecretKey(service.secret_key || '');
        setModel(service.default_model || 'kling-v2-1');
      }
    }
  }, [selectedService, services]);

  const handleGenerate = async () => {
    if (!selectedService) {
      message.warning('请选择视频生成服务');
      return;
    }
    if (!accessKey || !secretKey) {
      message.warning('请输入访问密钥');
      return;
    }
    if (!prompt.trim()) {
      message.warning('请输入视频生成提示词');
      return;
    }
    if (!startImage || !endImage) {
      message.warning('请先选择首帧和尾帧图片');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post('/api/video-generate', {
        service_id: selectedService,
        access_key: accessKey,
        secret_key: secretKey,
        prompt: prompt.trim(),
        start_frame_base64: startImage.base64,
        end_frame_base64: endImage.base64,
        model_name: model
      });

      const taskData = {
        task_id: response.data.task_id,
        service_id: selectedService,
        access_key: accessKey,
        secret_key: secretKey,
        prompt: prompt.trim()
      };
      
      onGenerate(taskData);
      message.success('视频生成任务已创建！');
    } catch (error) {
      console.error('视频生成失败:', error);
      message.error(error.response?.data?.detail || '视频生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handlePromptSelect = (selectedPrompt) => {
    setPrompt(selectedPrompt);
  };

  const handleSavePrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      message.warning('请输入提示词名称和内容');
      return;
    }

    try {
      await axios.post('/api/prompts', {
        name: newPromptName.trim(),
        prompt: newPromptContent.trim()
      });
      
      message.success('提示词保存成功！');
      setNewPromptName('');
      setNewPromptContent('');
      setPromptModalVisible(false);
      onPromptUpdate();
    } catch (error) {
      message.error(error.response?.data?.detail || '保存提示词失败');
    }
  };

  // 如果没有首帧或尾帧图片，显示提示信息
  if (!startImage || !endImage) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">请先选择首帧和尾帧图片</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            style={{ marginBottom: 16 }}
          >
            返回处理
          </Button>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <PlayCircleOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
            <Title level={3}>生成商品视频</Title>
            <Text type="secondary">
              使用AI技术将处理后的图片生成动态商品展示视频
            </Text>
          </div>
        </div>

        <Row gutter={24}>
          <Col span={12}>
            <Card title="首帧图片" size="small">
              <div className="image-preview" style={{ textAlign: 'center' }}>
                <img
                  src={`data:${startImage.mimeType};base64,${startImage.base64}`}
                  alt="首帧"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 8
                  }}
                />
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="尾帧图片" size="small">
              <div className="image-preview" style={{ textAlign: 'center' }}>
                <img
                  src={`data:${endImage.mimeType};base64,${endImage.base64}`}
                  alt="尾帧"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 8
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="生成设置" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>选择服务：</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="请选择视频生成服务"
                  value={selectedService}
                  onChange={setSelectedService}
                >
                  {services.map(service => (
                    <Option key={service.id} value={service.id}>
                      {service.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Access Key：</Text>
                <Input.Password
                  style={{ marginTop: 8 }}
                  placeholder="请输入Access Key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Secret Key：</Text>
                <Input.Password
                  style={{ marginTop: 8 }}
                  placeholder="请输入Secret Key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>模型版本：</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={model}
                  onChange={setModel}
                >
                  <Option value="kling-v1">Kling V1</Option>
                  <Option value="kling-v1-5">Kling V1.5</Option>
                  <Option value="kling-v1-6">Kling V1.6</Option>
                  <Option value="kling-v2-master">Kling V2 Master</Option>
                  <Option value="kling-v2-1">Kling V2.1</Option>
                  <Option value="kling-v2-1-master">Kling V2.1 Master</Option>
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>提示词库：</Text>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="选择预设提示词"
                    onChange={handlePromptSelect}
                    allowClear
                  >
                    {prompts.map((item, index) => (
                      <Option key={index} value={item.prompt}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                  <Button 
                    icon={<BookOutlined />}
                    onClick={() => setPromptModalVisible(true)}
                  >
                    管理
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>视频描述提示词：</Text>
            <TextArea
              style={{ marginTop: 8 }}
              rows={4}
              placeholder="请描述您希望生成的视频效果，例如：产品缓慢旋转360度，展示各个角度的细节，背景保持简洁，光线柔和均匀"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              loading={generating}
              onClick={handleGenerate}
              disabled={!selectedService || !accessKey || !secretKey || !prompt.trim()}
            >
              开始生成视频
            </Button>
          </div>
        </Card>
      </Card>

      <Modal
        title="提示词库管理"
        open={promptModalVisible}
        onCancel={() => setPromptModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>添加新提示词</Title>
          <Input
            placeholder="提示词名称"
            value={newPromptName}
            onChange={(e) => setNewPromptName(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <TextArea
            placeholder="提示词内容"
            rows={3}
            value={newPromptContent}
            onChange={(e) => setNewPromptContent(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleSavePrompt}
          >
            添加提示词
          </Button>
        </div>
        
        <div>
          <Title level={5}>现有提示词</Title>
          <List
            size="small"
            dataSource={prompts}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => {
                      setPrompt(item.prompt);
                      setPromptModalVisible(false);
                    }}
                  >
                    使用
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={item.prompt}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VideoGenerate;