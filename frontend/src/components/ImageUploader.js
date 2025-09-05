import React, { useState } from 'react';
import { Upload, message, Card, Button, Typography, Image, Space } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text } = Typography;

const ImageUploader = ({ 
  value, 
  onChange, 
  title = "上传图片", 
  description = "点击或拖拽图片到此区域上传",
  maxSize = 10, // MB
  accept = "image/*",
  showPreview = true,
  style = {}
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const beforeUpload = (file) => {
    // 检查文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    // 检查文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB！`);
      return false;
    }

    // 读取文件并转换为base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      const imageData = {
        id: `upload_${Date.now()}`,
        name: file.name,
        base64: base64,
        mimeType: file.type,
        size: file.size,
        timestamp: new Date().toISOString(),
        source: 'upload'
      };
      
      onChange && onChange(imageData);
      message.success('图片上传成功！');
    };
    reader.readAsDataURL(file);
    
    return false; // 阻止自动上传
  };

  const handleRemove = () => {
    onChange && onChange(null);
    message.success('图片已移除');
  };

  const handlePreview = () => {
    if (value && value.base64) {
      setPreviewImage(`data:${value.mimeType};base64,${value.base64}`);
      setPreviewVisible(true);
    }
  };

  return (
    <div style={style}>
      {value ? (
        <Card
          size="small"
          style={{
            border: '2px solid #52c41a',
            borderRadius: 8,
            overflow: 'hidden'
          }}
          styles={{ body: { padding: 12 } }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={`data:${value.mimeType};base64,${value.base64}`}
              alt={value.name}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'contain',
                borderRadius: 4,
                backgroundColor: '#fafafa'
              }}
            />
            
            {/* 操作按钮覆盖层 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s',
                borderRadius: 4
              }}
              className="image-overlay"
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0'}
            >
              <Space.Compact>
                {showPreview && (
                  <Button
                    type="primary"
                    ghost
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                  >
                    预览
                  </Button>
                )}
                <Button
                  type="primary"
                  danger
                  ghost
                  icon={<DeleteOutlined />}
                  onClick={handleRemove}
                >
                  移除
                </Button>
              </Space.Compact>
            </div>
          </div>
          
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <Text type="success" strong>✓ {value.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </div>
        </Card>
      ) : (
        <Dragger
          beforeUpload={beforeUpload}
          showUploadList={false}
          accept={accept}
          style={{
            border: '2px dashed #d9d9d9',
            borderRadius: 8,
            backgroundColor: '#fafafa',
            transition: 'all 0.3s'
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1890ff', fontSize: 48 }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
            {title}
          </p>
          <p className="ant-upload-hint" style={{ color: '#666' }}>
            {description}
          </p>
          <p className="ant-upload-hint" style={{ color: '#999', fontSize: 12 }}>
            支持 JPG、PNG、GIF 格式，文件大小不超过 {maxSize}MB
          </p>
        </Dragger>
      )}
      
      {/* 预览模态框 */}
      <Image
        width={200}
        style={{ display: 'none' }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
      

    </div>
  );
};

export default ImageUploader;