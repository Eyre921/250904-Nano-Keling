import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Input, Row, Col, Typography, message, Progress, Spin } from 'antd';
import { ArrowLeftOutlined, ScissorOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const BatchImageProcess = ({ batchImages, services, onProcess, onBack }) => {
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedService, setSelectedService] = useState('nano_banana_remove_bg_v1'); // 默认选择Nano Banana
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // 自动加载默认服务的API key
  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s.id === selectedService);
      if (service && service.api_key) {
        setApiKey(service.api_key);
      }
    }
  }, [selectedService, services]);

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service && service.api_key) {
      setApiKey(service.api_key);
    } else {
      setApiKey('');
    }
  };

  const handleBatchProcess = async () => {
    if (!selectedService || !apiKey) {
      message.error('请选择服务并输入API密钥');
      return;
    }

    setProcessing(true);
    setProcessedImages(new Array(batchImages.length).fill(null));
    setCurrentIndex(0);
    setProgress(0);

    const results = new Array(batchImages.length).fill(null);

    for (let i = 0; i < batchImages.length; i++) {
      setCurrentIndex(i + 1);
      
      try {
        const response = await fetch('/api/image-process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: selectedService,
            api_key: apiKey,
            image_base64: batchImages[i].base64,
            mime_type: batchImages[i].mimeType,
            custom_prompt: customPrompt
          })
        });

        if (response.ok) {
          const data = await response.json();
          const processedImage = {
            ...batchImages[i],
            processed_base64: data.image_base64,
            processed_mime_type: data.mime_type
          };
          results[i] = processedImage;
          // 使用函数式更新，按索引位置更新
          setProcessedImages(prev => {
            const newArray = [...prev];
            newArray[i] = processedImage;
            return newArray;
          });
        } else {
          message.error(`处理第 ${i + 1} 张图片失败`);
        }
      } catch (error) {
        message.error(`处理第 ${i + 1} 张图片时发生错误`);
      }

      setProgress(((i + 1) / batchImages.length) * 100);
    }

    setProcessing(false);
    
    // 将处理后的图片添加到图片库
    const successfulResults = results.filter(img => img !== null);
    if (successfulResults.length > 0) {
      const savedImages = localStorage.getItem('processedImages');
      const existingImages = savedImages ? JSON.parse(savedImages) : [];
      
      const timestamp = new Date().toISOString();
      const imagesWithMetadata = successfulResults.map((img, index) => ({
        id: `${timestamp}_${index}`,
        ...img,
        addedAt: timestamp,
        tags: ['批量处理', '已抠图']
      }));
      
      const updatedImages = [...existingImages, ...imagesWithMetadata];
      localStorage.setItem('processedImages', JSON.stringify(updatedImages));
    }
    
    message.success(`批量处理完成，成功处理 ${successfulResults.length} 张图片，已添加到图片库`);
  };

  const handleNext = () => {
    const successfulImages = processedImages.filter(img => img !== null);
    if (successfulImages.length === 0) {
      message.warning('请先处理图片');
      return;
    }
    
    // 如果只有一张图片，使用同一张作为首尾帧
    if (successfulImages.length === 1) {
      const processedImage = {
        base64: successfulImages[0].processed_base64,
        mimeType: successfulImages[0].processed_mime_type
      };
      onProcess(processedImage, processedImage);
    } else {
      // 多张图片时，传递所有处理后的图片供用户选择首尾帧
      onProcess(successfulImages);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
            <Title level={3}>批量图像背景处理</Title>
            <Text type="secondary">
              批量处理 {batchImages.length} 张商品图片，去除背景
            </Text>
          </div>
        </div>

        {/* 服务选择和配置 */}
        <Card title="处理配置" size="small" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>选择AI服务：</Text>
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
                <Input
                  style={{ marginTop: 8 }}
                  placeholder="请输入API密钥"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
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
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              size="large" 
              onClick={handleBatchProcess}
              loading={processing}
              disabled={!selectedService || !apiKey}
            >
              {processing ? `处理中 (${currentIndex}/${batchImages.length})` : '开始批量处理'}
            </Button>
          </div>

          {processing && (
            <div style={{ marginTop: 16 }}>
              <Progress percent={Math.round(progress)} status="active" />
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                正在处理第 {currentIndex} 张图片，共 {batchImages.length} 张
              </Text>
            </div>
          )}
        </Card>

        {/* 图片预览网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {batchImages.map((image, index) => {
            const processed = processedImages[index];
            return (
              <Card key={index} size="small" title={`图片 ${index + 1}`}>
                <Row gutter={8}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>原图</Text>
                      <div style={{ marginTop: 4 }}>
                        <img
                          src={`data:${image.mimeType};base64,${image.base64}`}
                          alt={`原图 ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>处理后</Text>
                      <div style={{ marginTop: 4, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                        {processed ? (
                          <img
                            src={`data:${processed.processed_mime_type};base64,${processed.processed_base64}`}
                            alt={`处理后 ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                        ) : processing && currentIndex > index ? (
                          <Spin size="small" />
                        ) : processed ? (
                          <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                        ) : (
                          <Text type="secondary">等待处理</Text>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>

        {processedImages.filter(img => img !== null).length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="primary" size="large" onClick={handleNext}>
              {processedImages.filter(img => img !== null).length === 1 ? '下一步：生成视频' : '下一步：选择首尾帧'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BatchImageProcess;