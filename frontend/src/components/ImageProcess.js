import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, message, Spin, Input, Select } from 'antd';
import { ArrowLeftOutlined, ScissorOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import BatchImageProcess from './BatchImageProcess';

const { Title, Text } = Typography;
const { Option } = Select;

const ImageProcess = ({ originalImage, batchImages, isBatchMode, services, onProcess, onBack }) => {
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedService, setSelectedService] = useState('nano_banana_remove_bg_v1'); // 默认选择Nano Banana
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // 自动加载默认服务的API key
  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s.id === selectedService);
      if (service && service.api_key) {
        setApiKey(service.api_key);
      }
    }
  }, [selectedService, services]);

  // 处理服务选择变化，自动填入预配置的API密钥
  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    
    // 查找选中服务的预配置API密钥
    const selectedServiceConfig = services.find(service => service.id === serviceId);
    if (selectedServiceConfig && selectedServiceConfig.api_key) {
      setApiKey(selectedServiceConfig.api_key);
    } else {
      setApiKey(''); // 如果没有预配置密钥，清空输入框
    }
  };

  const handleProcess = async () => {
    if (!selectedService) {
      message.warning('请选择图像处理服务');
      return;
    }
    if (!apiKey) {
      message.warning('请输入API密钥');
      return;
    }
    if (!originalImage) {
      message.warning('请先上传图片');
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post('/api/image-process', {
        service_id: selectedService,
        api_key: apiKey,
        image_base64: originalImage.base64,
        mime_type: originalImage.mimeType,
        custom_prompt: customPrompt
      });

      const processedData = {
        base64: response.data.image_base64,
        mimeType: response.data.mime_type
      };
      
      setProcessedImage(processedData);
      
      // 将处理后的图片添加到图片库
      const savedImages = localStorage.getItem('processedImages');
      const existingImages = savedImages ? JSON.parse(savedImages) : [];
      
      const timestamp = new Date().toISOString();
      const imageWithMetadata = {
        id: timestamp,
        name: originalImage.name,
        base64: originalImage.base64,
        mimeType: originalImage.mimeType,
        processed_base64: response.data.image_base64,
        processed_mime_type: response.data.mime_type,
        addedAt: timestamp,
        tags: ['单张处理', '已抠图']
      };
      
      const updatedImages = [...existingImages, imageWithMetadata];
      localStorage.setItem('processedImages', JSON.stringify(updatedImages));
      
      message.success('图像处理完成，已添加到图片库！');
    } catch (error) {
      console.error('图像处理失败:', error);
      message.error(error.response?.data?.detail || '图像处理失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleNext = () => {
    if (processedImage) {
      // 使用处理后的图像作为首帧和尾帧
      onProcess(processedImage, processedImage);
    } else {
      message.warning('请先处理图像');
    }
  };

  const downloadImage = (imageData, filename) => {
    const link = document.createElement('a');
    link.href = `data:${imageData.mimeType};base64,${imageData.base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 如果是批量模式，使用BatchImageProcess组件
  if (isBatchMode) {
    return (
      <BatchImageProcess
        batchImages={batchImages}
        services={services}
        onProcess={onProcess}
        onBack={onBack}
      />
    );
  }

  // 如果没有原始图片，显示提示信息
  if (!originalImage) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">请先上传图片</Text>
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
            返回上传
          </Button>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <ScissorOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
            <Title level={3}>图像背景处理</Title>
            <Text type="secondary">
              选择AI服务对商品图片进行背景去除处理
            </Text>
          </div>
        </div>

        <Row gutter={24}>
          <Col span={12}>
            <Card title="原始图片" size="small">
              <div className="image-preview" style={{ textAlign: 'center' }}>
                <img
                  src={`data:${originalImage.mimeType};base64,${originalImage.base64}`}
                  alt="原始图片"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 8
                  }}
                />
              </div>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Text type="secondary">{originalImage.name}</Text>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="处理后图片" size="small">
              <div className="image-preview" style={{ textAlign: 'center', minHeight: 300 }}>
                {processing ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Spin size="large" />
                    <div style={{ marginLeft: 16 }}>
                      <Text>正在处理图像...</Text>
                    </div>
                  </div>
                ) : processedImage ? (
                  <>
                    <img
                      src={`data:${processedImage.mimeType};base64,${processedImage.base64}`}
                      alt="处理后图片"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Button 
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => downloadImage(processedImage, 'processed_image.png')}
                      >
                        下载
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#999' }}>
                    <Text type="secondary">处理后的图片将显示在这里</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="处理设置" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>选择处理服务：</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="请选择图像处理服务"
                  value={selectedService}
                  onChange={handleServiceChange}
                >
                  {services.map(service => (
                    <Option key={service.id} value={service.id}>
                      {service.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>API密钥：</Text>
                <Input.Password
                  style={{ marginTop: 8 }}
                  placeholder="请输入API密钥"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={24}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>自定义抠图提示词（可选）：</Text>
                <Input.TextArea
                  style={{ marginTop: 8 }}
                  placeholder="输入自定义抠图提示词，例如：请保留商品主体，去除背景，确保边缘清晰"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  showCount
                  maxLength={500}
                />
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                  提示：留空将使用默认抠图提示词。自定义提示词可以帮助AI更好地理解您的抠图需求。
                </Text>
              </div>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              loading={processing}
              onClick={handleProcess}
              disabled={!selectedService || !apiKey}
              style={{ marginRight: 12 }}
            >
              开始处理
            </Button>
            
            {processedImage && (
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
              >
                下一步：生成视频
              </Button>
            )}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default ImageProcess;