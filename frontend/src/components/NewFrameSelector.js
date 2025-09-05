import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, message, Space, Divider, Tag, Steps } from 'antd';
import { ArrowRightOutlined, PlayCircleOutlined, PictureOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ImageUploader from './ImageUploader';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const NewFrameSelector = ({ 
  processedImages = [], 
  onFramesSelected, 
  onVideoGenerate,
  services = [],
  prompts = []
}) => {
  const [startFrame, setStartFrame] = useState(null);
  const [endFrame, setEndFrame] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideoSettings, setShowVideoSettings] = useState(false);

  // 如果有处理后的图片，自动设置首尾帧
  useEffect(() => {
    if (processedImages && processedImages.length > 0) {
      const firstImage = processedImages[0];
      const lastImage = processedImages[processedImages.length - 1];
      
      // 转换为统一格式
      const formatImage = (img, index) => ({
        id: `processed_${index}`,
        name: img.name || `处理后图片_${index + 1}`,
        base64: img.processed_base64 || img.base64,
        mimeType: img.processed_mime_type || img.mimeType,
        timestamp: new Date().toISOString(),
        source: 'processed'
      });
      
      setStartFrame(formatImage(firstImage, 0));
      if (processedImages.length > 1) {
        setEndFrame(formatImage(lastImage, processedImages.length - 1));
      } else {
        setEndFrame(formatImage(firstImage, 0));
      }
      
      setCurrentStep(1);
      message.success('已自动选择处理后的图片作为首尾帧');
    }
  }, [processedImages]);

  // 监听首尾帧选择状态
  useEffect(() => {
    if (startFrame && endFrame) {
      setCurrentStep(1);
    } else if (startFrame || endFrame) {
      setCurrentStep(0);
    }
  }, [startFrame, endFrame]);

  const handleStartFrameChange = (imageData) => {
    setStartFrame(imageData);
    if (imageData) {
      message.success('首帧图片设置成功');
    }
  };

  const handleEndFrameChange = (imageData) => {
    setEndFrame(imageData);
    if (imageData) {
      message.success('尾帧图片设置成功');
    }
  };

  const handleProceedToVideo = () => {
    if (!startFrame || !endFrame) {
      message.warning('请先选择首帧和尾帧图片');
      return;
    }
    
    setShowVideoSettings(true);
    setCurrentStep(2);
    
    // 传递首尾帧数据给父组件
    onFramesSelected && onFramesSelected({
      start: startFrame,
      end: endFrame
    });
  };

  const getStepStatus = (step) => {
    if (step < currentStep) return 'finish';
    if (step === currentStep) return 'process';
    return 'wait';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 进度指示器 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep} size="small">
          <Step 
            title="选择首尾帧" 
            description="上传或选择图片" 
            icon={<PictureOutlined />}
            status={getStepStatus(0)}
          />
          <Step 
            title="确认选择" 
            description="预览首尾帧效果" 
            icon={<CheckCircleOutlined />}
            status={getStepStatus(1)}
          />
          <Step 
            title="生成视频" 
            description="配置参数并生成" 
            icon={<PlayCircleOutlined />}
            status={getStepStatus(2)}
          />
        </Steps>
      </Card>

      {/* 主标题区域 */}
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Space direction="vertical" size="middle">
          <div>
            <PlayCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0 }}>🎬 视频生成工作台</Title>
          </div>
          <Paragraph type="secondary" style={{ fontSize: 16, margin: 0 }}>
            选择首尾帧图片，一键生成精美的商品展示视频
          </Paragraph>
          
          {processedImages.length > 0 && (
            <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
              ✨ 已自动加载 {processedImages.length} 张处理后的图片
            </Tag>
          )}
        </Space>
      </Card>

      {/* 首尾帧选择区域 */}
      <Card 
        title={
          <Space>
            <PictureOutlined />
            <span>第一步：选择首尾帧图片</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ color: '#1890ff', marginBottom: 8 }}>🎬 首帧图片</Title>
              <Text type="secondary">视频开始时显示的图片</Text>
            </div>
            <ImageUploader
              value={startFrame}
              onChange={handleStartFrameChange}
              title="上传首帧图片"
              description="选择视频开始时的画面"
              style={{ height: 280 }}
            />
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ color: '#52c41a', marginBottom: 8 }}>🎯 尾帧图片</Title>
              <Text type="secondary">视频结束时显示的图片</Text>
            </div>
            <ImageUploader
              value={endFrame}
              onChange={handleEndFrameChange}
              title="上传尾帧图片"
              description="选择视频结束时的画面"
              style={{ height: 280 }}
            />
          </Col>
        </Row>
        
        {/* 使用提示 */}
        <Divider />
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Space direction="vertical" size="small">
            <Text type="secondary">💡 使用提示</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              • 支持 JPG、PNG、GIF 格式，建议图片尺寸一致以获得最佳效果
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              • 首尾帧可以是同一张图片，AI 会自动生成过渡动画
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              • 如果您刚完成图片处理，系统已自动为您选择最佳首尾帧
            </Text>
          </Space>
        </div>
      </Card>

      {/* 预览和确认区域 */}
      {startFrame && endFrame && (
        <Card 
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>第二步：预览首尾帧效果</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={24}>
            <Col span={10}>
              <Card size="small" title="首帧预览" style={{ textAlign: 'center' }}>
                <img
                  src={`data:${startFrame.mimeType};base64,${startFrame.base64}`}
                  alt="首帧预览"
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: '2px solid #1890ff'
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">开始画面</Tag>
                </div>
              </Card>
            </Col>
            
            <Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <ArrowRightOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>AI 生成过渡</Text>
                </div>
              </div>
            </Col>
            
            <Col span={10}>
              <Card size="small" title="尾帧预览" style={{ textAlign: 'center' }}>
                <img
                  src={`data:${endFrame.mimeType};base64,${endFrame.base64}`}
                  alt="尾帧预览"
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: '2px solid #52c41a'
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="green">结束画面</Tag>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleProceedToVideo}
                style={{
                  height: 48,
                  fontSize: 16,
                  paddingLeft: 32,
                  paddingRight: 32
                }}
              >
                开始生成视频
              </Button>
            </Space>
          </div>
        </Card>
      )}
      
      {/* 快速操作提示 */}
      {!startFrame && !endFrame && processedImages.length === 0 && (
        <Card style={{ textAlign: 'center', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space direction="vertical" size="middle">
            <div>
              <PictureOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <Title level={4} style={{ color: '#52c41a', margin: '8px 0' }}>开始您的视频创作之旅</Title>
            </div>
            <Paragraph type="secondary">
              您可以直接上传图片开始创作，无需使用图片处理功能
            </Paragraph>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 提示：如果您需要去除图片背景，可以先使用上方的图片处理功能
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default NewFrameSelector;