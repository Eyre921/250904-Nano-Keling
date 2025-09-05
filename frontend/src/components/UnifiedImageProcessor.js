import React, { useState, useEffect } from 'react';
import { Upload, Card, Typography, message, Button, Select, Row, Col, Progress, Divider, Space, Image, Spin, Input } from 'antd';
import { InboxOutlined, ScissorOutlined, DeleteOutlined, EyeOutlined, CloudUploadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;

const UnifiedImageProcessor = ({ services, onProcess }) => {
  const [batchImages, setBatchImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (services && services.length > 0) {
      const defaultService = services.find(s => s.id === 'nano_banana_remove_bg_v1') || services[0];
      setSelectedService(defaultService.id);
      setApiKey(defaultService.api_key || '');
    }
  }, [services]);

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    setApiKey(service?.api_key || '');
  };

  const handleBatchUpload = (info) => {
    const { fileList } = info;
    
    fileList.forEach(file => {
      if (file.originFileObj && file.status !== 'done') {
        const isImage = file.originFileObj.type.startsWith('image/');
        if (!isImage) {
          message.error(`${file.name} 不是图片文件！`);
          return;
        }

        const isLt10M = file.originFileObj.size / 1024 / 1024 < 10;
        if (!isLt10M) {
          message.error(`${file.name} 大小不能超过10MB！`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(',')[1];
          const imageInfo = {
            base64,
            mimeType: file.originFileObj.type,
            name: file.originFileObj.name,
            size: file.originFileObj.size
          };
          
          setBatchImages(prev => {
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
      }
    });
  };

  const handleAutoProcess = async (images) => {
    if (!selectedService || !apiKey) {
      message.error('请选择服务并配置API密钥');
      return;
    }

    setProcessing(true);
    let tempProcessedImages = [...processedImages];
    
    for (let i = 0; i < images.length; i++) {
      const imageToProcess = images[i];
      
      try {
        const response = await fetch('/api/image-process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: selectedService,
            api_key: apiKey,
            image_base64: imageToProcess.base64,
            mime_type: imageToProcess.mimeType,
            custom_prompt: customPrompt
          })
        });

        if (response.ok) {
          const data = await response.json();
          const processedImage = {
            ...imageToProcess,
            processed_base64: data.image_base64,
            processed_mime_type: data.mime_type
          };
          
          // 找到原始图片在batchImages中的索引并更新临时数组
          const batchIndex = batchImages.findIndex(img => 
            img.name === imageToProcess.name && img.size === imageToProcess.size
          );
          
          // 确保数组长度足够
          while (tempProcessedImages.length <= batchIndex) {
            tempProcessedImages.push(null);
          }
          tempProcessedImages[batchIndex] = processedImage;
          
          message.success(`成功处理图片: ${imageToProcess.name}`);
        } else {
          message.error(`处理图片 ${imageToProcess.name} 失败`);
        }
      } catch (error) {
        message.error(`处理图片 ${imageToProcess.name} 时发生错误`);
      }
    }

    // 更新状态
    setProcessedImages(tempProcessedImages);
    
    // 检查是否有足够的处理结果可以传递给父组件
    const validResults = tempProcessedImages.filter(img => img !== null);
    if (validResults.length >= 2) {
      // 有至少2张处理好的图片，可以进行视频生成
      const startImage = {
        name: validResults[0].name,
        base64: validResults[0].processed_base64,
        mimeType: validResults[0].processed_mime_type,
        processed_base64: validResults[0].processed_base64,
        processed_mime_type: validResults[0].processed_mime_type
      };
      const endImage = {
        name: validResults[1].name,
        base64: validResults[1].processed_base64,
        mimeType: validResults[1].processed_mime_type,
        processed_base64: validResults[1].processed_base64,
        processed_mime_type: validResults[1].processed_mime_type
      };
      onProcess(startImage, endImage);
    } else if (validResults.length === 1) {
      // 只有1张图片，使用同一张作为开始和结束帧
      const processedImage = {
        name: validResults[0].name,
        base64: validResults[0].processed_base64,
        mimeType: validResults[0].processed_mime_type,
        processed_base64: validResults[0].processed_base64,
        processed_mime_type: validResults[0].processed_mime_type
      };
      onProcess(processedImage, processedImage);
    }

    setProcessing(false);
  };

  const handleManualProcess = () => {
    if (batchImages.length === 0) {
      message.warning('请先上传图片');
      return;
    }
    handleAutoProcess(batchImages);
  };

  const removeImage = (index) => {
    setBatchImages(prev => prev.filter((_, i) => i !== index));
    setProcessedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setBatchImages([]);
    setProcessedImages([]);
    setProgress(0);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <CloudUploadOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
        <Title level={3}>商品图片上传与智能处理</Title>
        <Text type="secondary">
          上传商品图片，自动去除背景，一站式处理
        </Text>
      </div>

      {/* 上传区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Dragger
          name="files"
          multiple
          accept="image/*"
          showUploadList={false}
          customRequest={() => {}}
          onChange={handleBatchUpload}
          style={{ padding: '20px' }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#667eea' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传，支持 JPG、PNG、WEBP 格式，单个文件不超过 10MB
          </p>
        </Dragger>
      </Card>

      {/* 处理配置 */}
      {batchImages.length > 0 && (
        <Card title="处理配置" size="small" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>AI服务：</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedService}
                  onChange={handleServiceChange}
                >
                  {services?.map(service => (
                    <Option key={service.id} value={service.id}>
                      {service.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>API密钥：</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                  {apiKey ? `已配置 (${apiKey.substring(0, 8)}...)` : '未配置'}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  onClick={handleManualProcess}
                  loading={processing}
                  disabled={!selectedService || !apiKey}
                  style={{ width: '100%' }}
                >
                  {processing ? '处理中...' : '开始处理'}
                </Button>
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
        </Card>
      )}

      {/* 处理进度 */}
      {processing && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <ScissorOutlined style={{ fontSize: 24, color: '#667eea', marginRight: 8 }} />
            <Text strong>正在处理图片...</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">请稍候，正在使用AI服务处理您的图片</Text>
            </div>
          </div>
        </Card>
      )}

      {/* 图片展示区域 - 重新设计 */}
      {batchImages.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <Title level={4} style={{ margin: 0 }}>
              图片处理工作台 ({batchImages.length}张)
            </Title>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={clearAll}
            >
              清空全部
            </Button>
          </div>
          
          <Row gutter={[24, 24]}>
            {batchImages.map((image, index) => {
              const processedImage = processedImages[index];
              const isProcessed = !!processedImage;
              
              return (
                <Col key={index} xs={24} sm={12} lg={8}>
                  <Card 
                    style={{ 
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: isProcessed ? '2px solid #52c41a' : '1px solid #d9d9d9'
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    {/* 图片标题栏 */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 12
                    }}>
                      <div>
                        <Text strong style={{ fontSize: 14 }}>{image.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {isProcessed && (
                          <div style={{
                            background: '#f6ffed',
                            color: '#52c41a',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            border: '1px solid #b7eb8f'
                          }}>
                            ✓ 已处理
                          </div>
                        )}
                        <Button 
                          type="text" 
                          size="small"
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => removeImage(index)}
                        />
                      </div>
                    </div>
                    
                    {/* 图片对比展示 */}
                    {isProcessed ? (
                      // 已处理：显示前后对比
                      <div>
                        <Row gutter={8}>
                          <Col span={12}>
                            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>原图</Text>
                            </div>
                            <div style={{ 
                              height: 150, 
                              borderRadius: 8, 
                              overflow: 'hidden',
                              border: '1px solid #f0f0f0'
                            }}>
                              <Image
                                src={`data:${image.mimeType};base64,${image.base64}`}
                                alt="原图"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                preview={{ mask: <EyeOutlined /> }}
                              />
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>处理后</Text>
                            </div>
                            <div style={{ 
                              height: 150, 
                              borderRadius: 8, 
                              overflow: 'hidden',
                              border: '2px solid #52c41a'
                            }}>
                              <Image
                                src={`data:${processedImage.processed_mime_type};base64,${processedImage.processed_base64}`}
                                alt="处理后"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                preview={{ mask: <EyeOutlined /> }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <div style={{ 
                          textAlign: 'center', 
                          marginTop: 12,
                          padding: '8px 12px',
                          background: '#f6ffed',
                          borderRadius: 6,
                          border: '1px solid #b7eb8f'
                        }}>
                          <Text style={{ color: '#52c41a', fontSize: 12, fontWeight: 500 }}>
                            🎉 背景移除完成，可用于视频生成
                          </Text>
                        </div>
                      </div>
                    ) : (
                      // 未处理：显示原图
                      <div>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>等待处理</Text>
                        </div>
                        <div style={{ 
                          height: 200, 
                          borderRadius: 8, 
                          overflow: 'hidden',
                          border: '1px solid #f0f0f0'
                        }}>
                          <Image
                            src={`data:${image.mimeType};base64,${image.base64}`}
                            alt={image.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            preview={{ mask: <EyeOutlined /> }}
                          />
                        </div>
                        <div style={{ 
                          textAlign: 'center', 
                          marginTop: 12,
                          padding: '8px 12px',
                          background: '#fafafa',
                          borderRadius: 6,
                          border: '1px solid #d9d9d9'
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ⏳ 点击"开始处理"进行背景移除
                          </Text>
                        </div>
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
};

export default UnifiedImageProcessor;