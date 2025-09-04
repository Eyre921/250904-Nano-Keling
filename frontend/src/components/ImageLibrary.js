import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Row, Col, Typography, message, Modal, Input, Tag, Space, Popconfirm } from 'antd';
import { PictureOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, FolderAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

const ImageLibrary = ({ onSelectImages, selectionMode = false, maxSelection = 2 }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filterImages = useCallback(() => {
    if (!searchText) {
      setFilteredImages(images);
    } else {
      const filtered = images.filter(img => 
        img.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        img.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredImages(filtered);
    }
  }, [images, searchText]);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchText, filterImages]);

  const loadImages = () => {
    // 从localStorage加载图片
    const savedImages = localStorage.getItem('processedImages');
    if (savedImages) {
      const parsedImages = JSON.parse(savedImages);
      setImages(parsedImages);
    }
  };

  const saveImages = (newImages) => {
    localStorage.setItem('processedImages', JSON.stringify(newImages));
    setImages(newImages);
  };



  const deleteImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    saveImages(updatedImages);
    message.success('图片已删除');
  };

  const handleImageSelect = (image) => {
    if (!selectionMode) return;

    const isSelected = selectedImages.find(img => img.id === image.id);
    
    if (isSelected) {
      setSelectedImages(selectedImages.filter(img => img.id !== image.id));
    } else {
      if (selectedImages.length < maxSelection) {
        setSelectedImages([...selectedImages, image]);
      } else {
        message.warning(`最多只能选择 ${maxSelection} 张图片`);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedImages.length === 0) {
      message.warning('请至少选择一张图片');
      return;
    }
    onSelectImages(selectedImages);
  };

  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = `data:${image.processed_mime_type || image.mimeType};base64,${image.processed_base64 || image.base64}`;
    link.download = `processed_${image.name}`;
    link.click();
  };

  const showPreview = (image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  // 暴露addImages方法给父组件
  // 注意：这个组件不需要使用useImperativeHandle，因为它不是通过ref调用的
  // React.useImperativeHandle应该在forwardRef组件中使用

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <PictureOutlined style={{ fontSize: 32, color: '#667eea', marginRight: 12 }} />
              <Title level={3} style={{ display: 'inline', margin: 0 }}>图片库管理</Title>
            </div>
            <Text type="secondary">共 {filteredImages.length} 张图片</Text>
          </div>
          
          <Row gutter={16} align="middle">
            <Col flex={1}>
              <Search
                placeholder="搜索图片名称或标签"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            {selectionMode && (
              <Col>
                <Space>
                  <Text>已选择: {selectedImages.length}/{maxSelection}</Text>
                  <Button 
                    type="primary" 
                    onClick={handleConfirmSelection}
                    disabled={selectedImages.length === 0}
                  >
                    确认选择
                  </Button>
                </Space>
              </Col>
            )}
          </Row>
        </div>

        {filteredImages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <FolderAddOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">图片库为空</Title>
            <Text type="secondary">处理图片后会自动添加到图片库中</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredImages.map((image) => {
              const isSelected = selectedImages.find(img => img.id === image.id);
              return (
                <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    size="small"
                    hoverable
                    className={selectionMode && isSelected ? 'selected-image' : ''}
                    onClick={() => handleImageSelect(image)}
                    style={{
                      border: selectionMode && isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: selectionMode ? 'pointer' : 'default'
                    }}
                    cover={
                      <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={`data:${image.processed_mime_type || image.mimeType};base64,${image.processed_base64 || image.base64}`}
                          alt={image.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {selectionMode && isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: '#1890ff',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12
                          }}>
                            ✓
                          </div>
                        )}
                      </div>
                    }
                    actions={!selectionMode ? [
                      <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={(e) => {
                          e.stopPropagation();
                          showPreview(image);
                        }}
                      />,
                      <Button 
                        type="text" 
                        icon={<DownloadOutlined />} 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image);
                        }}
                      />,
                      <Popconfirm
                        title="确定要删除这张图片吗？"
                        onConfirm={(e) => {
                          e.stopPropagation();
                          deleteImage(image.id);
                        }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    ] : []}
                  >
                    <Card.Meta
                      title={
                        <div style={{ fontSize: 12 }}>
                          {image.name?.length > 15 ? `${image.name.substring(0, 15)}...` : image.name}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            {image.tags?.map(tag => (
                              <Tag key={tag} size="small" color="blue">{tag}</Tag>
                            ))}
                          </div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {new Date(image.addedAt).toLocaleDateString()}
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* 图片预览模态框 */}
      <Modal
        open={previewVisible}
        title={previewImage?.name}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => downloadImage(previewImage)}>
            下载
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        {previewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={`data:${previewImage.processed_mime_type || previewImage.mimeType};base64,${previewImage.processed_base64 || previewImage.base64}`}
              alt={previewImage.name}
              style={{ maxWidth: '100%', maxHeight: 500 }}
            />
            <div style={{ marginTop: 16 }}>
              <Space>
                {previewImage.tags?.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  添加时间: {new Date(previewImage.addedAt).toLocaleString()}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .selected-image {
          box-shadow: 0 0 0 2px #1890ff;
        }
      `}</style>
    </div>
  );
};

export default ImageLibrary;