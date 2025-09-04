import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, message, Row, Col, Divider, Space } from 'antd';
import { PictureOutlined, CloudUploadOutlined, DatabaseOutlined, VideoCameraOutlined, SettingOutlined } from '@ant-design/icons';
import ImageUpload from './ImageUpload';

import BatchImageProcess from './BatchImageProcess';
import ImageLibrary from './ImageLibrary';
import FrameSelector from './FrameSelector';
import VideoGenerate from './VideoGenerate';
import MultiImageVideoGenerate from './MultiImageVideoGenerate';
import VideoStatus from './VideoStatus';
import ServiceConfig from './ServiceConfig';
import PromptLibrary from './PromptLibrary';

const { Content } = Layout;
const { Title, Text } = Typography;

const UnifiedInterface = () => {
  const [services, setServices] = useState({ image_services: [], video_services: [] });
  const [prompts, setPrompts] = useState([]);
  const [processedImages, setProcessedImages] = useState({ start: null, end: null });
  const [videoTask, setVideoTask] = useState(null);
  const [batchImages, setBatchImages] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchPrompts();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        console.log('Services data received:', data);
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      message.error('获取服务配置失败');
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      message.error('获取提示词库失败');
    }
  };

  const handleImageUpload = (imageData) => {
    setBatchImages(imageData);
    message.success(`已上传 ${imageData.length} 张图片`);
  };

  const handleImageProcess = (startImage, endImage) => {
    if (endImage) {
      // 单张图片模式：直接设置首尾帧
      setProcessedImages({ start: startImage, end: endImage });
      message.success('图片处理完成，可以开始视频生成');
    } else {
      // 多张图片模式：需要首尾帧选择
      setProcessedImages({ images: startImage });
      message.success('图片处理完成，请选择首尾帧');
    }
  };

  const handleFramesSelected = (frames) => {
    setProcessedImages(frames);
    message.success('首尾帧选择完成，可以开始视频生成');
  };

  const handleVideoGenerate = (taskData) => {
    setVideoTask(taskData);
    message.success('视频生成任务已创建，请查看生成状态');
  };

  // 移除tabItems，改为直接渲染组件

  return (
    <Content className="unified-interface" style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={1} className="gradient-text">
            AI商品视频智能生成器
          </Title>
          <Text type="secondary">
            一站式商品视频生成平台 - 图片上传、智能抠图、批量处理、视频生成
          </Text>
        </div>
        
        <Divider />
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 图片上传区域 */}
          <Card 
            title={(
              <span>
                <CloudUploadOutlined style={{ marginRight: 8 }} />
                图片上传
              </span>
            )} 
            variant="outlined"
            className="section-card fade-in"
          >
            <ImageUpload onUpload={handleImageUpload} />
          </Card>

          {/* 图片处理区域 */}
          {batchImages.length > 0 && (
            <Card 
               title={(
                 <span>
                   <DatabaseOutlined style={{ marginRight: 8 }} />
                   图片处理
                 </span>
               )} 
               variant="outlined"
               className="section-card fade-in"
             >
              <BatchImageProcess
                batchImages={batchImages}
                services={services.image_services}
                onProcess={handleImageProcess}
              />
            </Card>
          )}

          {/* 首尾帧选择区域 */}
          {(processedImages.images && processedImages.images.length > 1) && (
            <Card 
               title={(
                 <span>
                   <PictureOutlined style={{ marginRight: 8 }} />
                   首尾帧选择
                 </span>
               )} 
               variant="outlined"
               className="section-card fade-in"
             >
              <FrameSelector
                processedImages={processedImages.images}
                onFramesSelected={handleFramesSelected}
              />
            </Card>
          )}

          {/* 视频生成区域 */}
          {(processedImages.start && processedImages.end) && (
            <Card 
               title={(
                 <span>
                   <VideoCameraOutlined style={{ marginRight: 8 }} />
                   视频生成
                 </span>
               )} 
               variant="outlined"
               className="section-card fade-in"
             >
              <VideoGenerate
                startImage={processedImages.start}
                endImage={processedImages.end}
                services={services.video_services}
                prompts={prompts}
                onGenerate={handleVideoGenerate}
                onPromptUpdate={fetchPrompts}
              />
            </Card>
          )}

          {/* 多图参考生视频区域 */}
          <Card 
            title={(
              <span>
                <VideoCameraOutlined style={{ marginRight: 8 }} />
                多图参考生视频
              </span>
            )} 
            variant="outlined"
            className="section-card fade-in"
          >
            <MultiImageVideoGenerate
              services={services.video_services}
              prompts={prompts}
              onGenerate={handleVideoGenerate}
              onPromptUpdate={fetchPrompts}
            />
          </Card>

          {/* 视频状态区域 */}
          {videoTask && (
            <Card 
               title={(
                 <span>
                   <VideoCameraOutlined style={{ marginRight: 8 }} />
                   视频生成状态
                 </span>
               )} 
               variant="outlined"
               className="section-card fade-in"
             >
              <VideoStatus
                taskData={videoTask}
              />
            </Card>
          )}

          {/* 图片库区域 */}
          <Card 
            title={(
              <span>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                图片库管理
              </span>
            )} 
            variant="outlined"
            className="section-card fade-in"
          >
            <ImageLibrary />
          </Card>

          {/* 系统设置区域 */}
          <Card 
            title={(
              <span>
                <SettingOutlined style={{ marginRight: 8 }} />
                系统设置
              </span>
            )} 
            variant="outlined"
            className="section-card fade-in"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="服务配置">
                  <ServiceConfig services={services} onUpdate={fetchServices} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="提示词库">
                  <PromptLibrary prompts={prompts} onUpdate={fetchPrompts} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Space>
      </div>
    </Content>
  );
};

export default UnifiedInterface;