import requests
from bs4 import BeautifulSoup
import datetime
from sqlalchemy.orm import Session
from database import Hotspot, SessionLocal
import json
import re

def fetch_weibo_hot():
    """
    Fetch Weibo Hot Search (微博热搜)
    Uses Weibo's public API endpoint
    """
    url = "https://weibo.com/ajax/side/hotSearch"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://weibo.com"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            hot_list = []
            
            if 'data' in data and 'realtime' in data['data']:
                for idx, item in enumerate(data['data']['realtime'][:3]):
                    hot_list.append({
                        "title": item.get('note', item.get('word', '')),
                        "url": f"https://s.weibo.com/weibo?q=%23{item.get('word', '')}%23",
                        "hot_value": str(item.get('num', 0)),
                        "rank": idx + 1
                    })
            
            print(f"✅ Weibo: Fetched {len(hot_list)} items")
            return hot_list
        else:
            print(f"❌ Weibo failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Weibo error: {e}")
        return []

def fetch_zhihu_hot():
    """
    Fetch Zhihu Hot List (知乎热榜)
    Uses Zhihu's public API
    """
    url = "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.zhihu.com/hot"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            hot_list = []
            
            if 'data' in data:
                for item in data['data'][:3]:
                    target = item.get('target', {})
                    hot_list.append({
                        "title": target.get('title', ''),
                        "url": target.get('url', '').replace('api/v4/questions', 'question'),
                        "hot_value": target.get('detail_text', ''),
                        "rank": 0  # Will be set later
                    })
            
            print(f"✅ Zhihu: Fetched {len(hot_list)} items")
            return hot_list
        else:
            print(f"❌ Zhihu failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Zhihu error: {e}")
        return []

def fetch_baidu_hot():
    """
    Fetch Baidu Hot Search (百度热搜)
    """
    url = "https://top.baidu.com/api/board?platform=wise&tab=realtime"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://top.baidu.com/board?tab=realtime"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            hot_list = []
            
            if 'data' in data and 'cards' in data['data']:
                for card in data['data']['cards']:
                    if 'content' in card:
                        for item in card['content'][:3]:
                            hot_list.append({
                                "title": item.get('word', ''),
                                "url": item.get('url', ''),
                                "hot_value": item.get('hotScore', ''),
                                "rank": 0
                            })
                        break
            
            print(f"✅ Baidu: Fetched {len(hot_list)} items")
            return hot_list
        else:
            print(f"❌ Baidu failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Baidu error: {e}")
        return []

def fetch_douyin_hot():
    """
    Fetch Douyin Hot Search (抖音热搜)
    """
    url = "https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.douyin.com/"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            hot_list = []
            
            if 'word_list' in data:
                for item in data['word_list'][:3]:
                    hot_list.append({
                        "title": item.get('word', ''),
                        "url": f"https://www.douyin.com/search/{item.get('word', '')}",
                        "hot_value": str(item.get('hot_value', 0)),
                        "rank": 0
                    })
            
            print(f"✅ Douyin: Fetched {len(hot_list)} items")
            return hot_list
        else:
            print(f"❌ Douyin failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Douyin error: {e}")
        return []

def fetch_toutiao_hot():
    """
    Fetch Toutiao Hot News (今日头条热榜)
    Using alternative public API
    """
    url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.toutiao.com/"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            hot_list = []
            
            if 'data' in data:
                for item in data['data'][:3]:
                    hot_list.append({
                        "title": item.get('Title', item.get('title', '')),
                        "url": item.get('Url', item.get('url', '')),
                        "hot_value": str(item.get('HotValue', item.get('hot_value', 0))),
                        "rank": 0
                    })
            
            print(f"✅ Toutiao: Fetched {len(hot_list)} items")
            return hot_list
        else:
            print(f"❌ Toutiao failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Toutiao error: {e}")
        return []

def run_crawler_task():
    """
    Main crawler task that fetches from all sources
    """
    print("=" * 50)
    print("🚀 Starting crawler task...")
    print("=" * 50)
    
    db = SessionLocal()
    total_count = 0
    
    try:
        # Define all crawlers
        crawlers = [
            ("微博热搜", fetch_weibo_hot),
            ("知乎热榜", fetch_zhihu_hot),
            ("百度热搜", fetch_baidu_hot),
            ("抖音热搜", fetch_douyin_hot),
            ("今日头条", fetch_toutiao_hot),
        ]
        
        for source_name, fetch_func in crawlers:
            try:
                print(f"\n📡 Fetching {source_name}...")
                data = fetch_func()
                
                if data:
                    for idx, item in enumerate(data):
                        if item.get('title'):  # Only add if title exists
                            db.add(Hotspot(
                                source=source_name,
                                title=item['title'],
                                url=item.get('url', ''),
                                rank=idx + 1,
                                hot_value=str(item.get('hot_value', '')),
                                created_at=datetime.datetime.utcnow()
                            ))
                            total_count += 1
                else:
                    print(f"⚠️  {source_name}: No data returned")
                    
            except Exception as e:
                print(f"❌ {source_name} failed: {e}")
                continue
        
        db.commit()
        print("\n" + "=" * 50)
        print(f"✅ Crawler task completed! Total: {total_count} items")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Crawler task failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_crawler_task()
