import React, { useState } from 'react';
import { Upload, Card, Typography, message, Button } from 'antd';
import { InboxOutlined, PictureOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const ImageUpload = ({ onUpload }) => {
  const [batchImages, setBatchImages] = useState([]);



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
            // 检查是否已经存在相同的文件（基于名称和大小）
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

  const removeBatchImage = (index) => {
    setBatchImages(prev => prev.filter((_, i) => i !== index));
  };



  const handleNext = () => {
    if (batchImages.length > 0) {
      onUpload(batchImages);
    } else {
      message.warning('请先上传图片');
    }
  };



  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <PictureOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
          <Title level={3}>上传商品图片</Title>
          <Text type="secondary">
            支持 JPG、PNG、WEBP 格式，文件大小不超过 10MB，可单张或批量上传
          </Text>
        </div>

        <div>
          <Dragger
            name="images"
            multiple={true}
            onChange={handleBatchUpload}
            showUploadList={false}
            style={{ marginBottom: 24 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: '#667eea' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
            <p className="ant-upload-hint">
              支持单张或多张图片上传，可同时选择多个图片文件进行处理
            </p>
          </Dragger>
          {batchImages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Text strong>已上传 {batchImages.length} 张图片：</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {batchImages.map((img, index) => (
                  <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={`data:${img.mimeType};base64,${img.base64}`}
                      alt={img.name}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      onClick={() => removeBatchImage(index)}
                      style={{ position: 'absolute', top: -8, right: -8, minWidth: 20, height: 20 }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <Button type="primary" onClick={handleNext}>
                  开始处理 ({batchImages.length}张)
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImageUpload;