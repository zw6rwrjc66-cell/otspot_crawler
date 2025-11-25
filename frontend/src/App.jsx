import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Tag, Button, Select, Row, Col, Statistic, message, Switch, DatePicker, Space, Popconfirm, Modal } from 'antd';
import { ReloadOutlined, FireOutlined, BarChartOutlined, DashboardOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

const App = () => {
    const [hotspots, setHotspots] = useState([]);
    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [schedulerStatus, setSchedulerStatus] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [dateRange, setDateRange] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    useEffect(() => {
        fetchSources();
        fetchHotspots();
        fetchSchedulerStatus();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            if (autoRefresh) {
                fetchHotspots();
                fetchSchedulerStatus();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    useEffect(() => {
        fetchHotspots();
    }, [selectedSource, dateRange]);

    const fetchSources = async () => {
        try {
            const res = await axios.get('/api/sources');
            // res.data is now directly a list of strings
            setSources(res.data);
        } catch (error) {
            console.error("Failed to fetch sources", error);
        }
    };

    const fetchHotspots = async () => {
        setLoading(true);
        try {
            const params = selectedSource ? { source: selectedSource } : {};
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.start_time = dateRange[0].toISOString();
                params.end_time = dateRange[1].toISOString();
            }
            const res = await axios.get('/api/hotspots', { params });
            setHotspots(res.data);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedulerStatus = async () => {
        try {
            const res = await axios.get('/api/scheduler/status');
            setSchedulerStatus(res.data);
        } catch (error) {
            console.error('Failed to fetch scheduler status', error);
        }
    };

    const handleCrawl = async () => {
        message.loading({ content: 'Crawling in progress...', key: 'crawl' });
        try {
            const params = {};
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.start_time = dateRange[0].toISOString();
                params.end_time = dateRange[1].toISOString();
            }
            await axios.post('/api/crawl', null, { params });
            message.success({ content: 'Crawl triggered successfully!', key: 'crawl' });
            // Wait a bit for crawl to finish then refresh
            setTimeout(() => {
                fetchHotspots();
                fetchSources();
                fetchSchedulerStatus();
            }, 2000);
        } catch (error) {
            message.error({ content: 'Failed to trigger crawl', key: 'crawl' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/hotspots/${id}`);
            message.success('删除成功');
            fetchHotspots();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择要删除的记录');
            return;
        }

        try {
            await axios.delete('/api/hotspots', { data: selectedRowKeys });
            message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
            setSelectedRowKeys([]);
            fetchHotspots();
        } catch (error) {
            message.error('批量删除失败');
        }
    };

    const handleDeleteAll = async () => {
        if (hotspots.length === 0) {
            message.warning('没有可删除的记录');
            return;
        }

        const allIds = hotspots.map(h => h.id);
        try {
            await axios.delete('/api/hotspots', { data: allIds });
            message.success(`成功删除全部 ${allIds.length} 条记录`);
            setSelectedRowKeys([]);
            fetchHotspots();
        } catch (error) {
            message.error('删除全部失败');
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
        },
    };

    const showContentModal = (record) => {
        setCurrentRecord(record);
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        setIsModalVisible(false);
        setCurrentRecord(null);
    };

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            sorter: (a, b) => a.rank - b.rank,
            render: (text) => <Tag color={text <= 3 ? 'red' : 'blue'}>{text}</Tag>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterSearch: true,
            onFilter: (value, record) => record.title.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>,
        },
        {
            title: 'Hot Value',
            dataIndex: 'hot_value',
            key: 'hot_value',
            sorter: (a, b) => {
                const numA = parseInt(a.hot_value) || 0;
                const numB = parseInt(b.hot_value) || 0;
                return numA - numB;
            },
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            filters: sources.map(s => ({ text: s, value: s })),
            onFilter: (value, record) => record.source === value,
            render: (text) => <Tag color="cyan">{text}</Tag>,
        },
        {
            title: 'Time',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            render: (text) => new Date(text).toLocaleString('zh-CN'),
        },
        {
            title: 'Content',
            key: 'content',
            render: (_, record) => (
                <Button size="small" onClick={() => showContentModal(record)}>
                    View Details
                </Button>
            ),
        },
        {
            title: 'Summary',
            dataIndex: 'summary',
            key: 'summary',
            width: 200,
            ellipsis: true,
            render: (text) => text || <span style={{ color: '#ccc' }}>Generating...</span>,
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    onClick={() => handleDelete(record.id)}
                    size="small"
                >
                    删除
                </Button>
            ),
        },
    ];

    // Chart Data Preparation
    const getChartOption = () => {
        // Simple bar chart of top 10 hot values (parsing string to int might be needed)
        // For demo, let's just show count per source
        const sourceCount = {};
        hotspots.forEach(h => {
            sourceCount[h.source] = (sourceCount[h.source] || 0) + 1;
        });

        return {
            title: { text: 'Hotspots Distribution' },
            tooltip: {},
            xAxis: {
                data: Object.keys(sourceCount)
            },
            yAxis: {},
            series: [
                {
                    name: 'Count',
                    type: 'bar',
                    data: Object.values(sourceCount)
                }
            ]
        };
    };

    const [fetchingDetails, setFetchingDetails] = useState(false);

    const handleFetchDetails = async () => {
        if (!currentRecord) return;
        setFetchingDetails(true);
        try {
            const res = await axios.post(`/api/hotspots/${currentRecord.id}/fetch_details`);
            setCurrentRecord(res.data);
            // Update the record in the main list as well
            setHotspots(prev => prev.map(h => h.id === res.data.id ? res.data : h));
            message.success('Details fetched successfully');
        } catch (error) {
            message.error('Failed to fetch details');
        } finally {
            setFetchingDetails(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px' }}>
                    HotCrawler
                </div>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                    <Menu.Item key="1" icon={<DashboardOutlined />}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item key="2" icon={<BarChartOutlined />}>
                        Analytics
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header style={{ padding: '0 16px', background: '#fff' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <h2 style={{ margin: 0 }}>热点爬取 Dashboard</h2>
                        </Col>
                        <Col>
                            <Tag color="blue" icon={<CalendarOutlined />}>
                                手动触发模式
                            </Tag>
                        </Col>
                    </Row>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="筛选与爬取控制">
                                <Space size="large" wrap>
                                    <div>
                                        <span style={{ marginRight: 8 }}>数据源:</span>
                                        <Select
                                            style={{ width: 200 }}
                                            placeholder="全部数据源"
                                            allowClear
                                            onChange={setSelectedSource}
                                            value={selectedSource}
                                        >
                                            {sources.map(s => <Option key={s} value={s}>{s}</Option>)}
                                        </Select>
                                    </div>

                                    <div>
                                        <span style={{ marginRight: 8 }}>时间范围:</span>
                                        <RangePicker
                                            showTime
                                            onChange={setDateRange}
                                            placeholder={['开始时间', '结束时间']}
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        onClick={handleCrawl}
                                        size="large"
                                    >
                                        立即爬取
                                    </Button>
                                </Space>
                            </Card>
                        </Col>

                        <Col span={16}>
                            <Card
                                title="Hotspot List"
                                bordered={false}
                                extra={
                                    <Space>
                                        <Popconfirm
                                            title="批量删除"
                                            description={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                                            onConfirm={handleBatchDelete}
                                            okText="确定"
                                            cancelText="取消"
                                        >
                                            <Button
                                                type="primary"
                                                danger
                                                disabled={selectedRowKeys.length === 0}
                                                size="small"
                                            >
                                                删除选中 ({selectedRowKeys.length})
                                            </Button>
                                        </Popconfirm>
                                        <Popconfirm
                                            title="删除全部"
                                            description={`确定要删除全部 ${hotspots.length} 条记录吗？此操作不可恢复！`}
                                            onConfirm={handleDeleteAll}
                                            okText="确定"
                                            cancelText="取消"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                danger
                                                disabled={hotspots.length === 0}
                                                size="small"
                                            >
                                                删除全部
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                }
                            >
                                <Table
                                    dataSource={hotspots}
                                    columns={columns}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                    rowSelection={rowSelection}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="Statistics" bordered={false} style={{ marginBottom: 16 }}>
                                <Statistic title="Total Hotspots" value={hotspots.length} prefix={<FireOutlined />} />
                            </Card>

                            <Card
                                title="爬取模式"
                                bordered={false}
                                style={{ marginBottom: 16 }}
                                extra={
                                    <Tag color="blue">
                                        {schedulerStatus?.status === 'manual_only' ? '手动模式' : '加载中'}
                                    </Tag>
                                }
                            >
                                {schedulerStatus ? (
                                    <>
                                        <p><strong>模式:</strong> {schedulerStatus.mode}</p>
                                        <p><strong>说明:</strong> {schedulerStatus.description}</p>
                                        <p style={{ color: '#1890ff', marginTop: 12 }}>
                                            💡 在上方选择时间范围后，点击"立即爬取"按钮开始抓取
                                        </p>
                                    </>
                                ) : (
                                    <p>加载中...</p>
                                )}
                            </Card>

                            <Card title="Analytics" bordered={false}>
                                <ReactECharts option={getChartOption()} />
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
            <Modal
                title={currentRecord?.title}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalOk}
                width={800}
                footer={[
                    <Button key="close" onClick={handleModalOk}>
                        Close
                    </Button>
                ]}
            >
                {currentRecord && (
                    <div>
                        <p><strong>Source:</strong> {currentRecord.source}</p>
                        <p><strong>URL:</strong> <a href={currentRecord.url} target="_blank" rel="noopener noreferrer">{currentRecord.url}</a></p>

                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Summary & Content</h3>
                            <Button
                                type="primary"
                                onClick={handleFetchDetails}
                                loading={fetchingDetails}
                            >
                                {currentRecord.content ? 'Refresh Details' : 'Fetch Details & Summary'}
                            </Button>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <h4>Summary</h4>
                            <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 4, border: '1px solid #91d5ff' }}>
                                {currentRecord.summary || <span style={{ color: '#999' }}>No summary available. Click "Fetch Details" to generate.</span>}
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <h4>Full Content</h4>
                            <div style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                                {currentRecord.content || <span style={{ color: '#999' }}>Content not fetched yet. Click "Fetch Details" to crawl.</span>}
                            </div>
                        </div>

                        {currentRecord.media_paths && (
                            <div style={{ marginTop: 16 }}>
                                <h4>📸 Page Screenshot</h4>
                                <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, background: '#fafafa' }}>
                                    <img
                                        src={`http://localhost:8000${currentRecord.media_paths}`}
                                        alt="Page Screenshot"
                                        style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default App;
