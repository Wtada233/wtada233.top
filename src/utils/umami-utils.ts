import { umamiConfig } from "@configs/umami";

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export async function fetchUmamiStats(): Promise<void> {
    if (!umamiConfig.widgetEnabled) {
        return;
    }

    try {
        const endAt = Date.now();
        const startAt = 0;

        const url = `${umamiConfig.apiUrl}/websites/${umamiConfig.websiteId}/stats?startAt=${startAt}&endAt=${endAt}&unit=hour&timezone=Asia%2FShanghai`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'x-umami-share-token': umamiConfig.shareToken
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const pageviewsElement = document.getElementById('total-pageviews');
        const visitsElement = document.getElementById('total-visits');
        const visitorsElement = document.getElementById('total-visitors');

        if (pageviewsElement) {
            pageviewsElement.textContent = formatNumber(data.pageviews || 0);
        }

        if (visitsElement) {
            visitsElement.textContent = formatNumber(data.visits || 0);
        }

        if (visitorsElement) {
            visitorsElement.textContent = formatNumber(data.visitors || 0);
        }

    } catch (error) {
        console.error('获取Umami统计数据失败:', error);
        const elements = ['total-pageviews', 'total-visits', 'total-visitors'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '获取失败';
                element.classList.add('text-red-500');
            }
        });
    }
}
