import React, { useState } from 'react';
import { Modal, Button, Descriptions, Typography, Divider, Tag } from 'antd';
import { SettingOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ServiceConfig = ({ services, onUpdate }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const renderServiceInfo = (service, type) => {
    return (
      <div key={service.id} style={{ marginBottom: 24 }}>
        <Descriptions
          title={
            <div>
              <Tag color={type === 'image' ? 'blue' : 'green'}>
                {type === 'image' ? '图像处理' : '视频生成'}
              </Tag>
              {service.name}
            </div>
          }
          bordered
          size="small"
          column={1}
        >
          <Descriptions.Item label="服务ID">
            <Text code>{service.id}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="默认模型">
            <Text code>{service.default_model}</Text>
          </Descriptions.Item>
          
          {service.api_endpoint && (
            <Descriptions.Item label="API端点">
              <Text code style={{ fontSize: '12px' }}>
                {service.api_endpoint}
              </Text>
            </Descriptions.Item>
          )}
          
          {service.api_endpoint_base && (
            <Descriptions.Item label="API基础地址">
              <Text code style={{ fontSize: '12px' }}>
                {service.api_endpoint_base}
              </Text>
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="认证方式">
            <Tag color="orange">{service.auth?.type}</Tag>
            {service.auth?.key_name && (
              <Text type="secondary"> (参数: {service.auth.key_name})</Text>
            )}
            {service.auth?.header_name && (
              <Text type="secondary"> (头部: {service.auth.header_name})</Text>
            )}
          </Descriptions.Item>
          
          {service.endpoints && (
            <Descriptions.Item label="端点配置">
              <div>
                {Object.entries(service.endpoints).map(([key, value]) => (
                  <div key={key}>
                    <Text strong>{key}:</Text> <Text code>{value}</Text>
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
    );
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>图像处理服务</Title>
        {services.image_services?.length > 0 ? (
          services.image_services.map(service => (
            <div key={service.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
              <Text strong>{service.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>ID: {service.id}</Text>
            </div>
          ))
        ) : (
          <Text type="secondary">暂无配置的图像处理服务</Text>
        )}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>视频生成服务</Title>
        {services.video_services?.length > 0 ? (
          services.video_services.map(service => (
            <div key={service.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
              <Text strong>{service.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>ID: {service.id}</Text>
            </div>
          ))
        ) : (
          <Text type="secondary">暂无配置的视频生成服务</Text>
        )}
      </div>
      
      <Button
        icon={<SettingOutlined />}
        onClick={() => setModalVisible(true)}
        size="small"
      >
        查看详细配置
      </Button>
      
      <Modal
        title={
          <div>
            <ApiOutlined style={{ marginRight: 8 }} />
            AI服务配置信息
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Title level={4}>图像处理服务</Title>
          {services.image_services?.length > 0 ? (
            services.image_services.map(service => renderServiceInfo(service, 'image'))
          ) : (
            <Text type="secondary">暂无配置的图像处理服务</Text>
          )}
          
          <Divider />
          
          <Title level={4}>视频生成服务</Title>
          {services.video_services?.length > 0 ? (
            services.video_services.map(service => renderServiceInfo(service, 'video'))
          ) : (
            <Text type="secondary">暂无配置的视频生成服务</Text>
          )}
          
          <Divider />
          
          <div style={{ background: '#f6f8fa', padding: 16, borderRadius: 8 }}>
            <Title level={5}>配置说明</Title>
            <ul style={{ marginBottom: 0 }}>
              <li>图像处理服务用于商品图片的背景去除</li>
              <li>视频生成服务用于根据首尾帧图片生成动态视频</li>
              <li>服务配置存储在 <Text code>services_config.json</Text> 文件中</li>
              <li>使用前请确保已获取相应服务的API密钥</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ServiceConfig;