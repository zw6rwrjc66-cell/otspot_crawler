import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Tag, Button, Select, Row, Col, Statistic, message } from 'antd';
import { ReloadOutlined, FireOutlined, BarChartOutlined, DashboardOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const App = () => {
    const [hotspots, setHotspots] = useState([]);
    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSources();
        fetchHotspots();
    }, []);

    useEffect(() => {
        fetchHotspots();
    }, [selectedSource]);

    const fetchSources = async () => {
        try {
            const res = await axios.get('/api/sources');
            // res.data is like [['知乎热榜'], ['新浪新闻']]
            const sourceList = res.data.map(s => s[0]);
            setSources(sourceList);
        } catch (error) {
            console.error("Failed to fetch sources", error);
        }
    };

    const fetchHotspots = async () => {
        setLoading(true);
        try {
            const params = selectedSource ? { source: selectedSource } : {};
            const res = await axios.get('/api/hotspots', { params });
            setHotspots(res.data);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCrawl = async () => {
        message.loading({ content: 'Crawling in progress...', key: 'crawl' });
        try {
            await axios.post('/api/crawl');
            message.success({ content: 'Crawl triggered successfully!', key: 'crawl' });
            // Wait a bit for crawl to finish then refresh
            setTimeout(fetchHotspots, 2000);
            setTimeout(fetchSources, 2000);
        } catch (error) {
            message.error({ content: 'Failed to trigger crawl', key: 'crawl' });
        }
    };

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (text) => <Tag color={text <= 3 ? 'red' : 'blue'}>{text}</Tag>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>,
        },
        {
            title: 'Hot Value',
            dataIndex: 'hot_value',
            key: 'hot_value',
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (text) => <Tag color="cyan">{text}</Tag>,
        },
        {
            title: 'Time',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => new Date(text).toLocaleString(),
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
                            <h2 style={{ margin: 0 }}>Hotspot Dashboard</h2>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<ReloadOutlined />} onClick={handleCrawl}>
                                Trigger Crawl
                            </Button>
                        </Col>
                    </Row>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card>
                                <Row gutter={16} align="middle">
                                    <Col>Source Filter:</Col>
                                    <Col>
                                        <Select
                                            style={{ width: 200 }}
                                            placeholder="All Sources"
                                            allowClear
                                            onChange={setSelectedSource}
                                            value={selectedSource}
                                        >
                                            {sources.map(s => <Option key={s} value={s}>{s}</Option>)}
                                        </Select>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={16}>
                            <Card title="Hotspot List" bordered={false}>
                                <Table
                                    dataSource={hotspots}
                                    columns={columns}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="Statistics" bordered={false} style={{ marginBottom: 16 }}>
                                <Statistic title="Total Hotspots" value={hotspots.length} prefix={<FireOutlined />} />
                            </Card>
                            <Card title="Analytics" bordered={false}>
                                <ReactECharts option={getChartOption()} />
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
