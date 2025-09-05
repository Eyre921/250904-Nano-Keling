import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, message, Space, Select, Input, Slider, Modal, Form, Divider } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import ImageUploader from './ImageUploader';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const IntegratedVideoGenerator = ({ 
  startImage, 
  endImage, 
  services = [], 
  prompts = [], 
  onGenerate,
  onPromptUpdate,
  onBack,
  onFramesChange
}) => {
  // 视频生成参数
  const [selectedService, setSelectedService] = useState('kling_image2video_v1');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [prompt, setPrompt] = useState('产品缓慢旋转360度，展示各个角度的细节，背景保持简洁，光线柔和均匀');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('kling-v2-1');
  const [duration, setDuration] = useState('5');
  const [mode, setMode] = useState('pro');
  const [cfgScale, setCfgScale] = useState(0.5);
  
  // 首尾帧本地状态（内嵌上传）
  const [localStart, setLocalStart] = useState(startImage || null);
  const [localEnd, setLocalEnd] = useState(endImage || null);
  
  // UI 状态
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(0);

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

  // 同步外部首尾帧到本地
  useEffect(() => { setLocalStart(startImage || null); }, [startImage]);
  useEffect(() => { setLocalEnd(endImage || null); }, [endImage]);

  // 计算预估生成时间
  useEffect(() => {
    const baseTime = mode === 'pro' ? 180 : 120; // 仅用于估算
    const durationMultiplier = parseInt(duration) / 5; // 基于5秒计算
    setEstimatedTime(Math.round(baseTime * durationMultiplier));
  }, [mode, duration]);

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : serviceId;
  };

  const getModelName = (m) => {
    const map = {
      'kling-v2-1': 'Kling V2.1',
      'kling-v1-5': 'Kling V1.5',
      'kling-v1': 'Kling V1'
    };
    return map[m] || m;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const handleStartChange = (img) => {
    setLocalStart(img);
    onFramesChange && onFramesChange({ start: img, end: localEnd });
    if (img) message.success('首帧设置成功');
  };

  const handleEndChange = (img) => {
    setLocalEnd(img);
    onFramesChange && onFramesChange({ start: localStart, end: img });
    if (img) message.success('尾帧设置成功');
  };

  const handleGenerate = async () => {
    const sImg = localStart || startImage;
    const eImg = localEnd || endImage;

    if (!sImg || !eImg) {
      message.error('请先选择首帧和尾帧图片');
      return;
    }

    if (!accessKey || !secretKey) {
      message.error('请配置API密钥');
      return;
    }

    if (!prompt.trim()) {
      message.error('请输入视频描述');
      return;
    }

    setGenerating(true);
    
    try {
      const taskData = {
        service_id: selectedService,
        access_key: accessKey,
        secret_key: secretKey,
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        start_frame_base64: sImg.base64,
        end_frame_base64: eImg.base64,
        model_name: model,
        duration: duration,
        mode: mode,
        cfg_scale: cfgScale
      };

      await onGenerate(taskData);
      message.success('视频生成任务已创建，请查看生成状态');
    } catch (error) {
      console.error('视频生成失败:', error);
      message.error('视频生成失败，请检查配置并重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePrompt = () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      message.error('请填写提示词名称和内容');
      return;
    }

    const newPrompt = {
      id: Date.now().toString(),
      name: newPromptName.trim(),
      content: newPromptContent.trim(),
      category: 'custom',
      created_at: new Date().toISOString()
    };

    onPromptUpdate && onPromptUpdate([...prompts, newPrompt]);
    setPromptModalVisible(false);
    setNewPromptName('');
    setNewPromptContent('');
    message.success('提示词已保存');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* 首尾帧选择（内嵌） */}
      <Card 
        title={<span>首尾帧选择</span>}
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>首帧图片</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>视频开始画面</Text>
            </div>
            <ImageUploader
              value={localStart}
              onChange={handleStartChange}
              title="上传首帧图片"
              description="选择视频开始画面"
              style={{ height: 260 }}
              showPreview={false}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>尾帧图片</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>视频结束画面</Text>
            </div>
            <ImageUploader
              value={localEnd}
              onChange={handleEndChange}
              title="上传尾帧图片"
              description="选择视频结束画面"
              style={{ height: 260 }}
              showPreview={false}
            />
          </Col>
        </Row>
      </Card>

      {/* 视频生成配置 */}
      <Card 
        title={
          <Space>
            <SettingOutlined />
            <span>视频生成配置</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={24}>
          {/* 基础配置 */}
          <Col span={24}>
            <Title level={5} style={{ marginBottom: 16 }}>基础设置</Title>
          </Col>
          
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>生成服务：</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={selectedService}
                onChange={setSelectedService}
              >
                {services.filter(service => service && service.id).map(service => (
                  <Option key={service.id} value={service.id}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>视频时长：</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={duration}
                onChange={setDuration}
              >
                <Option value="5">5秒 (推荐)</Option>
                <Option value="10">10秒</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>选择模型：</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={model}
                onChange={setModel}
              >
                <Option value="kling-v2-1">Kling V2.1</Option>
                <Option value="kling-v1-5">Kling V1.5</Option>
                <Option value="kling-v1">Kling V1</Option>
              </Select>
            </div>
          </Col>
          
          {/* 提示词配置 */}
          <Col span={24}>
            <Divider />
            <Title level={5} style={{ marginBottom: 16 }}>视频描述</Title>
          </Col>
          
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>视频描述提示词：</Text>
                <Space>
                  <Select
                    style={{ width: 200 }}
                    placeholder="选择预设提示词"
                    allowClear
                    onChange={(value) => {
                      const selectedPrompt = prompts.find(p => p.id === value);
                      if (selectedPrompt) {
                        setPrompt(selectedPrompt.content);
                      }
                    }}
                  >
                    {prompts.filter(p => p && p.id).map(p => (
                      <Option key={p.id} value={p.id}>{p.name}</Option>
                    ))}
                  </Select>
                  <Button 
                    type="dashed" 
                    size="small"
                    icon={<SaveOutlined />}
                    onClick={() => {
                      setNewPromptContent(prompt);
                      setPromptModalVisible(true);
                    }}
                  >
                    保存提示词
                  </Button>
                </Space>
              </div>
              <TextArea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述您希望生成的视频效果，例如：产品缓慢旋转360度，展示各个角度的细节..."
                showCount
                maxLength={2500}
              />
            </div>
          </Col>
          
          {/* 高级设置 */}
          <Col span={24}>
            <Button 
              type="link" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ padding: 0, marginBottom: 16 }}
            >
              {showAdvanced ? '收起' : '展开'}高级设置
            </Button>
            
            {showAdvanced && (
              <div>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>负向提示词：</Text>
                      <TextArea
                        rows={3}
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="描述不希望出现的内容..."
                        style={{ marginTop: 8 }}
                        maxLength={2500}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>创意自由度：{cfgScale}</Text>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={cfgScale}
                        onChange={setCfgScale}
                        style={{ marginTop: 8 }}
                        marks={{
                          0: '更自由',
                          0.5: '平衡',
                          1: '更精确'
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* 生成预估和操作 */}
      <Card>
        <Row gutter={24} align="middle">
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small">
              <div>
                <Text strong style={{ fontSize: 16 }}>准备生成视频</Text>
              </div>
              <div>
                <Text type="secondary">服务：{getServiceName(selectedService)}</Text>
                <Divider type="vertical" />
                <Text type="secondary">模型：{getModelName(model)}</Text>
                <Divider type="vertical" />
                <Text type="secondary">时长：{duration}秒</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  预计生成时间：{formatTime(estimatedTime)}
                </Text>
              </div>
            </Space>
          </Col>
          
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="middle"
              onClick={handleGenerate}
              loading={generating}
              disabled={!localStart || !localEnd || !accessKey || !secretKey || !prompt.trim()}
            >
              {generating ? '生成中...' : '开始生成视频'}
            </Button>
          </Col>
        </Row>
        
        {(!accessKey || !secretKey) && (
          <div style={{ marginTop: 16, padding: 12, background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 6 }}>
            <Text type="warning">
              请先在服务配置中设置 API 密钥才能开始生成
            </Text>
          </div>
        )}
      </Card>

      {/* 保存提示词弹窗 */}
      <Modal
        title="保存提示词"
        open={promptModalVisible}
        onCancel={() => setPromptModalVisible(false)}
        onOk={handleSavePrompt}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="提示词名称" required>
            <Input value={newPromptName} onChange={(e) => setNewPromptName(e.target.value)} placeholder="例如：360度旋转展示" />
          </Form.Item>
          <Form.Item label="提示词内容" required>
            <TextArea rows={4} value={newPromptContent} onChange={(e) => setNewPromptContent(e.target.value)} placeholder="请输入要保存的提示词内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IntegratedVideoGenerator;