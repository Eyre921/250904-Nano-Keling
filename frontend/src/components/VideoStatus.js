import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, message, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, DownloadOutlined, RedoOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const VideoStatus = ({ taskData, onReset, onBack }) => {
  const [status, setStatus] = useState('processing');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!taskData) return;

    setLoading(true);
    try {
      // 根据任务类型选择不同的API端点
      const endpoint = taskData.type === 'multi-image' 
        ? `/api/multi-image-video-status/${taskData.task_id}?service_id=${taskData.service_id}&access_key=${taskData.access_key}&secret_key=${taskData.secret_key}`
        : `/api/video-status/${taskData.task_id}?service_id=${taskData.service_id}&access_key=${taskData.access_key}&secret_key=${taskData.secret_key}`;
      
      const response = await axios.get(endpoint);

      const data = response.data;
      setStatus(data.status);
      
      if (data.status === 'succeed' && data.video_url) {
        setVideoUrl(data.video_url);
        setAutoRefresh(false);
        message.success('视频生成完成！');
      } else if (data.status === 'failed') {
        setError(data.error || '视频生成失败');
        setAutoRefresh(false);
        message.error('视频生成失败');
      }
      // 移除虚假进度条逻辑，只根据实际状态显示
    } catch (error) {
      console.error('查询状态失败:', error);
      const errorMsg = error.response?.data?.detail || '查询状态失败';
      setError(errorMsg);
      // 网络错误或临时错误时不停止自动刷新，允许自动重试
      if (error.response?.status >= 500 || !error.response) {
        console.log('检测到临时错误，将继续自动重试...');
      } else {
        // 只有在客户端错误（4xx）时才停止自动刷新
        setAutoRefresh(false);
      }
    } finally {
      setLoading(false);
    }
  }, [taskData]);

  useEffect(() => {
    if (taskData && autoRefresh) {
      checkStatus();
      const interval = setInterval(() => {
        if (autoRefresh) {
          checkStatus();
        }
      }, 10000); // 每10秒检查一次状态

      return () => clearInterval(interval);
    }
  }, [taskData, autoRefresh, checkStatus]);

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `generated_video_${taskData.task_id}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'processing':
        return {
          type: 'info',
          title: '正在生成视频...',
          description: '请耐心等待，视频生成通常需要1-3分钟。系统每10秒自动查询一次状态，如遇临时错误会自动重试。',
          showSpinner: true
        };
      case 'succeed':
        return {
          type: 'success',
          title: '视频生成完成！',
          description: '您的商品展示视频已成功生成',
          showSpinner: false
        };
      case 'failed':
        return {
          type: 'error',
          title: '视频生成失败',
          description: error || '生成过程中出现错误，请重试',
          showSpinner: false
        };
      default:
        return {
          type: 'info',
          title: '准备中...',
          description: '正在初始化视频生成任务',
          showSpinner: true
        };
    }
  };

  const statusInfo = getStatusInfo();

  // 如果没有任务数据，显示空状态（简洁文本，无大图标）
  if (!taskData) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '28px 12px' }}>
            <Title level={4} type="secondary">暂无视频生成任务</Title>
            <Text type="secondary">
              完成图片处理和首尾帧选择后，在视频生成区域创建任务
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            style={{ marginBottom: 16 }}
          >
            返回设置
          </Button>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>视频生成状态</Title>
            <Text type="secondary">
              任务ID: {taskData?.task_id}
            </Text>
          </div>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Alert
            message={statusInfo.title}
            description={statusInfo.description}
            type={statusInfo.type}
            showIcon
            style={{ marginBottom: statusInfo.showSpinner ? 16 : 0 }}
          />
          
          {statusInfo.showSpinner && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">正在处理中，请稍候...</Text>
              </div>
            </div>
          )}
        </Card>

        {taskData && (
          <Card title="任务信息" size="small" style={{ marginBottom: 24 }}>
            <Paragraph>
              <Text strong>提示词：</Text>
              <br />
              {taskData.prompt}
            </Paragraph>
            <Paragraph>
              <Text strong>服务：</Text> {taskData.service_id}
            </Paragraph>
          </Card>
        )}

        {videoUrl && (
          <Card title="生成结果" style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="video-preview" style={{ marginBottom: 16 }}>
                <video
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: 400,
                    borderRadius: 8
                  }}
                  poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7op4bpopHpooTop4g8L3RleHQ+PC9zdmc+"
                >
                  <source src={videoUrl} type="video/mp4" />
                  您的浏览器不支持视频播放。
                </video>
              </div>
              
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="middle"
                onClick={handleDownload}
                style={{ marginRight: 12 }}
              >
                下载视频
              </Button>
            </div>
          </Card>
        )}

        <div style={{ textAlign: 'center' }}>
          {status === 'processing' && (
            <>
              <Button
                icon={<ReloadOutlined />}
                onClick={checkStatus}
                loading={loading}
                style={{ marginRight: 12 }}
              >
                刷新状态
              </Button>
              
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                type={autoRefresh ? 'default' : 'primary'}
              >
                {autoRefresh ? '停止自动刷新' : '开启自动刷新'}
              </Button>
            </>
          )}
          
          {(status === 'succeed' || status === 'failed') && (
            <Button
              type="primary"
              icon={<RedoOutlined />}
              size="middle"
              onClick={onReset}
            >
              重新开始
            </Button>
          )}
        </div>
        
        {loading && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Spin />
            <Text style={{ marginLeft: 8 }}>正在查询状态...</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoStatus;