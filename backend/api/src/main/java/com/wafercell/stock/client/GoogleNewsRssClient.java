package com.wafercell.stock.client;

import lombok.Data;
import com.wafercell.stock.dto.RssItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class GoogleNewsRssClient {

    private final RestClient restClient = RestClient.create();

    public List<RssItem> fetchNewsRss(String ticker) {
        List<RssItem> items = new ArrayList<>();
        try {
            // Google News RSS 검색 URL 주소 설정 (영문 검색 고정)
            String url = String.format("https://news.google.com/rss/search?q=%s+stock&hl=en-US&gl=US&ceid=US:en", ticker.trim().toUpperCase());
            String xmlResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (xmlResponse == null || xmlResponse.isEmpty()) {
                return items;
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // XML 외부 엔티티 취약점(XXE) 방지 보안 설정
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes(StandardCharsets.UTF_8)));

            NodeList nodeList = doc.getElementsByTagName("item");
            // 상위 5개의 기사만 파싱합니다.
            for (int i = 0; i < Math.min(nodeList.getLength(), 5); i++) {
                Element element = (Element) nodeList.item(i);
                RssItem item = new RssItem();
                item.setTitle(getTagValue("title", element));
                item.setLink(getTagValue("link", element));
                item.setPubDate(getTagValue("pubDate", element));
                item.setSource(getTagValue("source", element));
                items.add(item);
            }
        } catch (Exception e) {
            log.error("💥 Google News RSS 수집 실패 (티커: {}): {}", ticker, e.getMessage(), e);
        }
        return items;
    }

    private String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return "";
    }
}
