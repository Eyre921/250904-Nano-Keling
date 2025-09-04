import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Row, Col, Typography, message, Upload, Modal, Input, Select, Divider } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, PictureOutlined, SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Search } = Input;
const { Option } = Select;

const FrameSelector = ({ processedImages, onFramesSelected, onBack }) => {
  const [startFrame, setStartFrame] = useState(null);
  const [endFrame, setEndFrame] = useState(null);
  const [libraryImages, setLibraryImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState('start'); // 'start' or 'end'

  useEffect(() => {
    if (processedImages && processedImages.length > 0) {
      // 使用传入的处理后图片
      const formattedImages = processedImages.map((img, index) => ({
        id: `processed_${index}`,
        base64: img.processed_base64,
        mimeType: img.processed_mime_type,
        tags: ['当前处理'],
        addedAt: new Date().toISOString()
      }));
      setLibraryImages(formattedImages);
      setAvailableTags(['当前处理']);
    } else {
      loadLibraryImages();
    }
  }, [processedImages]);

  const filterImages = useCallback(() => {
    let filtered = libraryImages;
    
    if (searchText) {
      filtered = filtered.filter(img => 
        (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))) ||
        (img.timestamp && new Date(img.timestamp).toLocaleString().includes(searchText))
      );
    }
    
    if (filterTag) {
      filtered = filtered.filter(img => 
        img.tags && img.tags.includes(filterTag)
      );
    }
    
    setFilteredImages(filtered);
  }, [libraryImages, searchText, filterTag]);

  useEffect(() => {
    filterImages();
  }, [filterImages]);

  const loadLibraryImages = () => {
    const savedImages = localStorage.getItem('processedImages');
    if (savedImages) {
      const parsedImages = JSON.parse(savedImages);
      setLibraryImages(parsedImages);
      
      // 提取所有标签
      const tags = new Set();
      parsedImages.forEach(img => {
        if (img.tags && Array.isArray(img.tags)) {
          img.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));
    }
  };

  const handleImageSelect = (image, type) => {
    if (type === 'start') {
      setStartFrame(image);
    } else {
      setEndFrame(image);
    }
  };

  const handleUpload = (file, type) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      const imageData = {
        id: `upload_${Date.now()}`,
        base64: base64,
        mimeType: file.type,
        timestamp: new Date().toISOString(),
        tags: ['上传图片'],
        source: 'upload'
      };
      
      if (type === 'start') {
        setStartFrame(imageData);
      } else {
        setEndFrame(imageData);
      }
      
      setUploadModalVisible(false);
      message.success(`${type === 'start' ? '首帧' : '尾帧'}图片上传成功`);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const handleNext = () => {
    if (!startFrame || !endFrame) {
      message.warning('请选择首帧和尾帧图片');
      return;
    }
    
    onFramesSelected({
      start: startFrame,
      end: endFrame
    });
  };

  const renderImageCard = (image, type, isSelected) => {
    const isStart = type === 'start';
    const borderColor = isSelected ? '#1890ff' : '#d9d9d9';
    
    return (
      <Card
        key={`${image.id}_${type}`}
        size="small"
        style={{
          border: `2px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onClick={() => handleImageSelect(image, type)}
        hoverable
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={`data:${image.mimeType};base64,${image.base64}`}
            alt={isStart ? '首帧候选' : '尾帧候选'}
            style={{
              width: '100%',
              height: 120,
              objectFit: 'contain',
              borderRadius: 4
            }}
          />
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <Text type="secondary">
              {new Date(image.timestamp).toLocaleDateString()}
            </Text>
            {image.tags && (
              <div style={{ marginTop: 4 }}>
                {image.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-block',
                      background: '#f0f0f0',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      marginRight: 4
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
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
            返回处理
          </Button>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <PictureOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
            <Title level={3}>选择首尾帧</Title>
            <Text type="secondary">
              从图片库中选择或上传新图片作为视频的首帧和尾帧
            </Text>
          </div>
        </div>

        {/* 当前选择的首尾帧 */}
        <Card title="当前选择" style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: 20, border: '2px dashed #d9d9d9', borderRadius: 8 }}>
                {startFrame ? (
                  <div>
                    <img
                      src={`data:${startFrame.mimeType};base64,${startFrame.base64}`}
                      alt="首帧"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong>首帧已选择</Text>
                      <br />
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setStartFrame(null)}
                      >
                        重新选择
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>
                      <Text type="secondary">请选择首帧图片</Text>
                      <br />
                      <Button 
                        type="primary" 
                        ghost 
                        size="small"
                        style={{ marginTop: 8 }}
                        onClick={() => {
                          setUploadType('start');
                          setUploadModalVisible(true);
                        }}
                      >
                        上传新图片
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: 20, border: '2px dashed #d9d9d9', borderRadius: 8 }}>
                {endFrame ? (
                  <div>
                    <img
                      src={`data:${endFrame.mimeType};base64,${endFrame.base64}`}
                      alt="尾帧"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong>尾帧已选择</Text>
                      <br />
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setEndFrame(null)}
                      >
                        重新选择
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>
                      <Text type="secondary">请选择尾帧图片</Text>
                      <br />
                      <Button 
                        type="primary" 
                        ghost 
                        size="small"
                        style={{ marginTop: 8 }}
                        onClick={() => {
                          setUploadType('end');
                          setUploadModalVisible(true);
                        }}
                      >
                        上传新图片
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* 图片库筛选 */}
        <Card title="从图片库选择" style={{ marginBottom: 24 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Search
                placeholder="搜索标签或日期"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Select
                style={{ width: '100%' }}
                placeholder="按标签筛选"
                value={filterTag}
                onChange={setFilterTag}
                allowClear
              >
                {availableTags.map(tag => (
                  <Option key={tag} value={tag}>{tag}</Option>
                ))}
              </Select>
            </Col>
          </Row>

          {filteredImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <div>
                <Text type="secondary">暂无图片</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  请先处理一些图片或调整筛选条件
                </Text>
              </div>
            </div>
          ) : (
            <div>
              <Divider orientation="left">点击图片选择为首帧</Divider>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {filteredImages.map(image => (
                  <Col key={`start_${image.id}`} xs={12} sm={8} md={6} lg={4}>
                    {renderImageCard(image, 'start', startFrame?.id === image.id)}
                  </Col>
                ))}
              </Row>
              
              <Divider orientation="left">点击图片选择为尾帧</Divider>
              <Row gutter={[16, 16]}>
                {filteredImages.map(image => (
                  <Col key={`end_${image.id}`} xs={12} sm={8} md={6} lg={4}>
                    {renderImageCard(image, 'end', endFrame?.id === image.id)}
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={handleNext}
            disabled={!startFrame || !endFrame}
          >
            下一步：生成视频
          </Button>
        </div>
      </Card>

      {/* 上传图片Modal */}
      <Modal
        title={`上传${uploadType === 'start' ? '首帧' : '尾帧'}图片`}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Dragger
          accept="image/*"
          beforeUpload={(file) => handleUpload(file, uploadType)}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
          <p className="ant-upload-hint">
            支持 JPG、PNG、GIF 等格式，建议图片尺寸不超过 2MB
          </p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default FrameSelector;