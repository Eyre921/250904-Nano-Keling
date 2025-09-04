import React, { useState } from 'react';
import { Card, Button, Row, Col, Typography, message, Input, Select, Upload, Space, Tag, Modal } from 'antd';
import { PlayCircleOutlined, BookOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const MultiImageVideoGenerate = ({ services, prompts, onGenerate, onPromptUpdate }) => {
  const [imageList, setImageList] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [accessKey, setAccessKey] = useState('AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA');
  const [secretKey, setSecretKey] = useState('QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('');
  const [duration, setDuration] = useState('5');

  // 移除生成模式选择，使用默认的pro模式
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [promptModalVisible, setPromptModalVisible] = useState(false);


  // 上传前检查
  const beforeUpload = (file, fileList) => {
    // 检查当前图片数量限制
    if (imageList.length >= 2) {
      message.warning('最多只能上传2张图片');
      return false;
    }
    
    // 检查文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(`${file.name} 不是图片文件！`);
      return false;
    }

    // 检查文件大小
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(`${file.name} 大小不能超过10MB！`);
      return false;
    }

    // 检查是否已存在相同文件
    const exists = imageList.some(img => 
      img.name === file.name && img.size === file.size
    );
    if (exists) {
      message.warning(`${file.name} 已经上传过了`);
      return false;
    }

    return false; // 阻止自动上传，手动处理
  };

  // 处理图片上传
  const handleImageUpload = (info) => {
    const { fileList } = info;
    
    // 只处理新添加的文件
    const newFiles = fileList.filter(file => 
      file.originFileObj && 
      !imageList.some(img => img.name === file.name && img.size === file.size)
    );
    
    newFiles.forEach(file => {
      if (imageList.length >= 2) {
        return; // 已达到上限，不再处理
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        const imageInfo = {
          base64,
          mimeType: file.originFileObj.type,
          name: file.originFileObj.name,
          size: file.originFileObj.size,
          preview: e.target.result
        };
        
        setImageList(prev => {
          // 再次检查数量限制和重复
          if (prev.length >= 2) {
            return prev;
          }
          const exists = prev.some(img => 
            img.name === imageInfo.name && img.size === imageInfo.size
          );
          if (!exists) {
            return [...prev, imageInfo];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file.originFileObj);
    });
  };

  // 删除图片
  const removeImage = (index) => {
    setImageList(prev => prev.filter((_, i) => i !== index));
  };

  // 预览图片
  const showPreview = (image) => {
    setPreviewImage(image.preview);
    setPreviewVisible(true);
  };

  // 选择提示词
  const selectPrompt = (selectedPrompt) => {
    setPrompt(selectedPrompt.prompt);
    setPromptModalVisible(false);
    message.success(`已选择提示词: ${selectedPrompt.name}`);
  };

  // 生成视频
  const handleGenerate = async () => {
    if (!selectedService) {
      message.error('请选择视频生成服务');
      return;
    }
    if (!accessKey || !secretKey) {
      message.error('请输入Access Key和Secret Key');
      return;
    }
    if (imageList.length < 1) {
      message.error('请至少上传一张图片');
      return;
    }
    if (!prompt.trim()) {
      message.error('请输入提示词');
      return;
    }

    setLoading(true);
    try {
      // 根据图片数量决定单图或双图模式
      let requestData = {
        service_id: selectedService,
        access_key: accessKey,
        secret_key: secretKey,
        prompt: prompt.trim(),
        model_name: model,
        negative_prompt: negativePrompt.trim() || undefined,
        duration: duration,
        mode: 'pro'
      };
      
      if (imageList.length === 1) {
        // 单图模式：只传image参数
        requestData.image_list = [imageList[0].base64];
      } else {
        // 双图模式：传image和image_tail参数
        requestData.image_list = [
          imageList[0].base64,  // 首帧
          imageList[1].base64   // 尾帧
        ];
      }
      
      const response = await axios.post('/api/multi-image-video-generate', requestData);

      if (response.data && response.data.task_id) {
        const successMessage = imageList.length === 1 ? '单图视频生成任务创建成功！' : '多图视频生成任务创建成功！';
        message.success(successMessage);
        onGenerate({
          task_id: response.data.task_id,
          service_id: selectedService,
          access_key: accessKey,
          secret_key: secretKey,
          type: imageList.length === 1 ? 'single-image' : 'multi-image'
        });
      } else {
        throw new Error('未收到有效的任务ID');
      }
    } catch (error) {
      console.error('Multi-image video generation error:', error);
      let errorMessage = '多图视频生成失败';
      
      if (error.response?.data?.detail) {
        // 处理FastAPI验证错误
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <PlayCircleOutlined style={{ fontSize: 32, color: '#667eea', marginRight: 12 }} />
          <Title level={3} style={{ display: 'inline', margin: 0 }}>图片生视频</Title>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            上传1-2张图片生成视频：单图模式或首尾帧模式
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* 左侧：图片上传区域 */}
          <Col span={12}>
            <Card size="small" title="图片上传" style={{ height: '100%' }}>
              <Dragger
                name="images"
                multiple={true}
                beforeUpload={beforeUpload}
                onChange={handleImageUpload}
                showUploadList={false}
                style={{ marginBottom: 16 }}
                disabled={imageList.length >= 2}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 32, color: '#667eea' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                <p className="ant-upload-hint">
                  支持JPG、PNG格式，可上传1-2张图片，单图模式或首尾帧模式，每张不超过10MB
                </p>
              </Dragger>

              {/* 已上传图片列表 */}
              {imageList.length > 0 && (
                <div>
                  <Text strong>已上传 {imageList.length}/2 张图片：</Text>
                  <Text type="secondary" style={{ display: 'block', marginTop: 4, marginBottom: 8 }}>
                    {imageList.length === 1 ? '单图模式：基于此图片生成视频' : '双图模式：第一张为首帧，第二张为尾帧，生成过渡视频'}
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {imageList.map((img, index) => {
                      const frameLabel = imageList.length === 1 ? '图片' : (index === 0 ? '首帧' : '尾帧');
                      const borderColor = imageList.length === 1 ? '#667eea' : (index === 0 ? '#52c41a' : '#1890ff');
                      
                      return (
                        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={img.preview}
                            alt={img.name}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 4,
                              border: `3px solid ${borderColor}`
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: '#ff4d4f',
                            color: 'white',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 12
                          }} onClick={() => removeImage(index)}>
                            ×
                          </div>
                          <Tag size="small" style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 10, backgroundColor: borderColor, color: 'white', border: 'none' }}>
                             {frameLabel}
                           </Tag>

                         </div>
                       );
                     })}
                   </div>
                   

                 </div>
               )}
            </Card>
          </Col>

          {/* 右侧：参数配置区域 */}
          <Col span={12}>
            <Card size="small" title="生成参数" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* 服务选择 */}
                <div>
                  <Text strong>视频生成服务：</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    placeholder="选择视频生成服务"
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

                {/* API凭证 */}
                <Row gutter={8}>
                  <Col span={12}>
                    <Text strong>Access Key：</Text>
                    <Input
                      placeholder="输入Access Key"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      style={{ marginTop: 4 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Text strong>Secret Key：</Text>
                    <Input.Password
                      placeholder="输入Secret Key"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      style={{ marginTop: 4 }}
                    />
                  </Col>
                </Row>

                {/* 模型和参数 */}
                <Row gutter={8}>
                  <Col span={8}>
                    <Text strong>模型版本：</Text>
                    <Select
                      style={{ width: '100%', marginTop: 4 }}
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
                  </Col>
                  <Col span={8}>
                    <Text strong>时长：</Text>
                    <Select
                      style={{ width: '100%', marginTop: 4 }}
                      value={duration}
                      onChange={setDuration}
                    >
                      <Option value="5">5秒</Option>
                      <Option value="10">10秒</Option>
                    </Select>
                  </Col>

                </Row>

                {/* 生成模式已移除，使用默认pro模式 */}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 提示词区域 */}
        <Card size="small" title="提示词设置" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <Space>
              <Text strong>正向提示词：</Text>
              <Button 
                size="small" 
                icon={<BookOutlined />} 
                onClick={() => setPromptModalVisible(true)}
              >
                选择预设提示词
              </Button>
            </Space>
          </div>
          <TextArea
            rows={3}
            placeholder="描述你想要的视频效果，例如：产品缓慢旋转360度，展示各个角度的细节，背景保持简洁，光线柔和均匀"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          
          <div style={{ marginBottom: 12 }}>
            <Text strong>负向提示词（可选）：</Text>
          </div>
          <TextArea
            rows={2}
            placeholder="描述你不想要的效果，例如：模糊、变形、不自然的动作"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </Card>

        {/* 生成按钮 */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleGenerate}
            loading={loading}
            disabled={imageList.length === 0 || !selectedService || !accessKey || !secretKey || !prompt.trim()}
          >
            {imageList.length === 1 ? '生成单图视频' : '生成起始帧到结束帧视频'}
          </Button>
        </div>
      </Card>

      {/* 提示词选择Modal */}
      <Modal
        title="选择预设提示词"
        open={promptModalVisible}
        onCancel={() => setPromptModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {prompts.map((promptItem, index) => (
            <Card
              key={index}
              size="small"
              hoverable
              onClick={() => selectPrompt(promptItem)}
              style={{ marginBottom: 8, cursor: 'pointer' }}
            >
              <div>
                <Text strong>{promptItem.name}</Text>
                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                  {promptItem.prompt}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* 图片预览Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={600}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default MultiImageVideoGenerate;