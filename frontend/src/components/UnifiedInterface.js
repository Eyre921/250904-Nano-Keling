import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, message, Row, Col, Divider, Space } from 'antd';
import UnifiedImageProcessor from './UnifiedImageProcessor';
import ImageLibrary from './ImageLibrary';
// import NewFrameSelector from './NewFrameSelector';
import IntegratedVideoGenerator from './IntegratedVideoGenerator';
import VideoStatus from './VideoStatus';
import ServiceConfig from './ServiceConfig';
import PromptLibrary from './PromptLibrary';

const { Content } = Layout;
const { Title, Text } = Typography;

const UnifiedInterface = () => {
  const [services, setServices] = useState({ image_services: [], video_services: [] });
  const [prompts, setPrompts] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedFrames, setSelectedFrames] = useState({ start: null, end: null });
  const [videoTask, setVideoTask] = useState(null);
  // 移除currentView状态，直接显示所有组件


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
      console.log('Fetching prompts...');
      const response = await fetch('/api/prompts');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Prompts data received:', data);
        setPrompts(data.prompts || []);
      } else {
        console.error('Failed to fetch prompts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      message.error('获取提示词库失败');
    }
  };



  // 处理图片处理完成
  const handleImageProcess = (images) => {
    setProcessedImages(Array.isArray(images) ? images : [images]);
    message.success('图片处理完成，请选择首尾帧');
  };

  const handleFramesSelected = (frames) => {
    console.log('Frames selected:', frames);
    setSelectedFrames(frames);
    message.success('首尾帧选择完成，开始配置视频生成参数');
  };

  const handleVideoGenerate = async (taskData) => {
    try {
      const response = await fetch('/api/video-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setVideoTask({
          task_id: result.task_id,
          service_id: taskData.service_id,
          status: 'processing',
          created_at: new Date().toISOString(),
          ...taskData
        });
        message.success('视频生成任务已创建，请查看生成状态');
      } else {
        throw new Error('视频生成请求失败');
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      message.error('视频生成失败，请检查配置并重试');
      throw error;
    }
  };

  const handleBackToUpload = () => {
    // 重置状态
    setProcessedImages([]);
    setSelectedFrames({ start: null, end: null });
  };

  const handleBackToFrames = () => {
    setSelectedFrames({ start: null, end: null });
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
          {/* 图片上传处理区域 */}
           <Card 
              title="图片处理工作台"
              size="small"
              style={{ marginBottom: 16 }}
            >
             <UnifiedImageProcessor services={services.image_services} onProcess={handleImageProcess} />
           </Card>

          {/* 视频生成区域（内嵌首尾帧选择） */}
           <Card 
              title="视频生成工作台"
              size="small"
              style={{ marginBottom: 16 }}
            >
             <IntegratedVideoGenerator
               startImage={selectedFrames.start}
               endImage={selectedFrames.end}
               services={services.video_services}
               prompts={prompts}
               onGenerate={handleVideoGenerate}
               onPromptUpdate={fetchPrompts}
               onFramesChange={handleFramesSelected}
             />
           </Card>

          {/* 视频状态区域 */}
           {videoTask && (
             <Card 
                title="生成状态"
                size="small"
                style={{ marginBottom: 16 }}
              >
               <VideoStatus taskData={videoTask} onReset={() => setVideoTask(null)} onBack={() => setVideoTask(null)} />
             </Card>
           )}

          {/* 图片库区域 */}
           <Card 
              title="图片库"
              size="small"
              style={{ marginBottom: 16 }}
            >
             <ImageLibrary />
           </Card>

          {/* 系统设置区域 */}
           <Row gutter={[12, 12]}>
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
        </Space>
      </div>
    </Content>
  );
};

export default UnifiedInterface;