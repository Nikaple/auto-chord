#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
时间戳生成脚本
用于生成项目中使用的一致时间戳
"""

import sys
import datetime
import argparse

def generate_timestamp(format_type="full"):
    """
    生成指定格式的时间戳
    
    参数:
        format_type (str): 时间戳格式类型
            - "full": 完整格式 (YYYY-MM-DD HH:MM:SS)
            - "date": 仅日期 (YYYY-MM-DD)
            - "datetime": 日期和时间 (YYYYMMDD_HHMMSS)
            - "compact": 紧凑格式 (YYYYMMDD)
            - "week": 周格式 (YYYYWNN)
    
    返回:
        str: 格式化的时间戳
    """
    now = datetime.datetime.now()
    
    if format_type == "full":
        return now.strftime("%Y-%m-%d %H:%M:%S")
    elif format_type == "date":
        return now.strftime("%Y-%m-%d")
    elif format_type == "datetime":
        return now.strftime("%Y%m%d_%H%M%S")
    elif format_type == "compact":
        return now.strftime("%Y%m%d")
    elif format_type == "week":
        return now.strftime("%Y") + "W" + now.strftime("%U").zfill(2)
    else:
        return "无效的格式类型"

def main():
    parser = argparse.ArgumentParser(description="生成指定格式的时间戳")
    parser.add_argument(
        "format", 
        nargs="?", 
        default="full",
        choices=["full", "date", "datetime", "compact", "week"],
        help="时间戳格式 (full, date, datetime, compact, week)"
    )
    
    args = parser.parse_args()
    print(generate_timestamp(args.format))

if __name__ == "__main__":
    main() 