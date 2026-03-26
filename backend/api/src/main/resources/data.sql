-- 반도체 세부 섹터(공정)별 주요 종목 데이터 삽입
-- 거래소 코드 원복 (NAS, NYS)

-- 1. 팹리스 (Fabless)
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('NVDA', '엔비디아', 'NAS', '팹리스');
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('AMD', 'AMD', 'NAS', '팹리스');
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('AVGO', '브로드컴', 'NAS', '팹리스');
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('QCOM', '퀄컴', 'NAS', '팹리스');
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('ARM', 'ARM', 'NAS', 'IP');

-- 2. 파운드리 (Foundry)
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('TSM', 'TSMC', 'NYS', '파운드리');

-- 3. 소부장 (Equipment/Materials)
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('ASML', 'ASML', 'NAS', '소부장');
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('AMAT', '어플라이드 머티어리얼즈', 'NAS', '소부장');
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('LRCX', '램 리서치', 'NAS', '소부장');

-- 4. 메모리 (Memory)
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('MU', '마이크론', 'NAS', '메모리');

-- 5. IDM (Integrated Device Manufacturer)
INSERT INTO stocks (ticker, name, exchange, sector) VALUES ('INTC', '인텔', 'NAS', 'IDM');
