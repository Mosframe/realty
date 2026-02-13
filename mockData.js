// Mock data for testing when external API is not accessible
const mockData = {
    // 시도 목록
    regions_0000000000: {
        "regionList": [
            {
                "cortarNo": "1100000000",
                "centerLat": 37.566427,
                "centerLon": 126.977872,
                "cortarName": "서울시",
                "cortarType": "city"
            },
            {
                "cortarNo": "4100000000",
                "centerLat": 37.274939,
                "centerLon": 127.008689,
                "cortarName": "경기도",
                "cortarType": "city"
            },
            {
                "cortarNo": "2600000000",
                "centerLat": 35.159527,
                "centerLon": 129.061229,
                "cortarName": "부산시",
                "cortarType": "city"
            }
        ]
    },
    // 경기도 시/군/구
    regions_4100000000: {
        "regionList": [
            {
                "cortarNo": "4159700000",
                "centerLat": 37.197266,
                "centerLon": 127.096607,
                "cortarName": "화성시 동탄구",
                "cortarType": "dvsn"
            },
            {
                "cortarNo": "4113500000",
                "centerLat": 37.394,
                "centerLon": 127.11,
                "cortarName": "성남시 분당구",
                "cortarType": "dvsn"
            }
        ]
    },
    // 화성시 동탄구 동 목록
    regions_4159700000: {
        "regionList": [
            {
                "cortarNo": "4159710400",
                "centerLat": 37.192398,
                "centerLon": 127.097583,
                "cortarName": "오산동",
                "cortarType": "sec"
            },
            {
                "cortarNo": "4159710300",
                "centerLat": 37.201,
                "centerLon": 127.075,
                "cortarName": "영천동",
                "cortarType": "sec"
            }
        ]
    },
    // 오산동 아파트 단지 목록
    complexes_4159710400: {
        "complexList": [
            {
                "complexNo": "119652",
                "complexName": "동탄역롯데캐슬(주상복합)",
                "cortarNo": "4159710400",
                "realEstateTypeCode": "APT",
                "realEstateTypeName": "아파트",
                "detailAddress": "1089",
                "latitude": 37.199274,
                "longitude": 127.097351,
                "totalHouseholdCount": 940,
                "totalBuildingCount": 4,
                "highFloor": 49,
                "lowFloor": 49,
                "useApproveYmd": "20210629",
                "dealCount": 21,
                "leaseCount": 1,
                "rentCount": 0,
                "shortTermRentCount": 0,
                "isInterest": true,
                "cortarAddress": "경기도 화성시 동탄구 오산동",
                "tourExist": false
            },
            {
                "complexNo": "119653",
                "complexName": "동탄역 센트럴파크 푸르지오",
                "cortarNo": "4159710400",
                "realEstateTypeCode": "APT",
                "realEstateTypeName": "아파트",
                "detailAddress": "1088",
                "latitude": 37.199,
                "longitude": 127.098,
                "totalHouseholdCount": 1200,
                "totalBuildingCount": 6,
                "highFloor": 45,
                "lowFloor": 45,
                "useApproveYmd": "20210701",
                "dealCount": 15,
                "leaseCount": 2,
                "rentCount": 0,
                "shortTermRentCount": 0,
                "isInterest": false,
                "cortarAddress": "경기도 화성시 동탄구 오산동",
                "tourExist": false
            }
        ]
    },
    // 아파트 단지 정보 - 동탄역롯데캐슬
    complex_119652: {
        "complex": {
            "complexNo": "119652",
            "complexName": "동탄역롯데캐슬(주상복합)",
            "cortarNo": "4159710400",
            "realEstateTypeCode": "APT",
            "realEstateTypeName": "아파트",
            "detailAddress": "1089",
            "latitude": 37.199274,
            "longitude": 127.097351,
            "totalHouseholdCount": 940,
            "totalBuildingCount": 4,
            "highFloor": 49,
            "lowFloor": 49,
            "useApproveYmd": "20210629",
            "dealCount": 21,
            "leaseCount": 1,
            "rentCount": 0,
            "shortTermRentCount": 0,
            "isInterest": true,
            "cortarAddress": "경기도 화성시 동탄구 오산동",
            "tourExist": false
        },
        "areaList": [
            {
                "pyeongNo": 1,
                "supplyAreaDouble": 90.67,
                "supplyArea": "90.67",
                "pyeongName": "90",
                "pyeongName2": "27",
                "grandPlanUrl": "/20180220_93/hscp_img_15191170286477cBzg_JPEG/photoinfra_1519117028351.jpg",
                "exclusiveArea": "65.96",
                "exclusivePyeong": "19.95"
            },
            {
                "pyeongNo": 2,
                "supplyAreaDouble": 74.12,
                "supplyArea": "74.12",
                "pyeongName": "74",
                "pyeongName2": "22",
                "grandPlanUrl": "/20180220_93/hscp_img_15191170286477cBzg_JPEG/photoinfra_1519117028351.jpg",
                "exclusiveArea": "54.32",
                "exclusivePyeong": "16.43"
            }
        ]
    },
    // 아파트 단지 정보 - 동탄역 센트럴파크 푸르지오
    complex_119653: {
        "complex": {
            "complexNo": "119653",
            "complexName": "동탄역 센트럴파크 푸르지오",
            "cortarNo": "4159710400",
            "realEstateTypeCode": "APT",
            "realEstateTypeName": "아파트",
            "detailAddress": "1088",
            "latitude": 37.199,
            "longitude": 127.098,
            "totalHouseholdCount": 1200,
            "totalBuildingCount": 6,
            "highFloor": 45,
            "lowFloor": 45,
            "useApproveYmd": "20210701",
            "dealCount": 15,
            "leaseCount": 2,
            "rentCount": 0,
            "shortTermRentCount": 0,
            "isInterest": false,
            "cortarAddress": "경기도 화성시 동탄구 오산동",
            "tourExist": false
        },
        "areaList": [
            {
                "pyeongNo": 1,
                "supplyAreaDouble": 84.98,
                "supplyArea": "84.98",
                "pyeongName": "84",
                "pyeongName2": "25",
                "exclusiveArea": "59.98",
                "exclusivePyeong": "18.14"
            }
        ]
    },
    // 실거래가 - 동탄역롯데캐슬 90평형
    prices_119652_1: {
        "areaNo": 1,
        "realPriceOnMonthList": [
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 2,
                        "tradeDate": "10",
                        "dealPrice": 160000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 45,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "16억",
                        "formattedTradeYearMonth": "2026.02.10"
                    },
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 1,
                        "tradeDate": "31",
                        "dealPrice": 158000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 48,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "15억 8,000",
                        "formattedTradeYearMonth": "2026.01.31"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 2
            },
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 1,
                        "tradeDate": "15",
                        "dealPrice": 155000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 32,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "15억 5,000",
                        "formattedTradeYearMonth": "2026.01.15"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 1
            }
        ],
        "addedRowCount": 3,
        "totalRowCount": 21,
        "realPriceBasisYearMonth": "202602"
    },
    // 실거래가 - 동탄역롯데캐슬 74평형
    prices_119652_2: {
        "areaNo": 2,
        "realPriceOnMonthList": [
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 2,
                        "tradeDate": "05",
                        "dealPrice": 135000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 28,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "13억 5,000",
                        "formattedTradeYearMonth": "2026.02.05"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 2
            }
        ],
        "addedRowCount": 1,
        "totalRowCount": 8,
        "realPriceBasisYearMonth": "202602"
    },
    // 실거래가 - 동탄역 센트럴파크 푸르지오 84평형
    prices_119653_1: {
        "areaNo": 1,
        "realPriceOnMonthList": [
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 2,
                        "tradeDate": "12",
                        "dealPrice": 142000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 38,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "14억 2,000",
                        "formattedTradeYearMonth": "2026.02.12"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 2
            },
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 1,
                        "tradeDate": "20",
                        "dealPrice": 140000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 25,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "14억",
                        "formattedTradeYearMonth": "2026.01.20"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 1
            }
        ],
        "addedRowCount": 2,
        "totalRowCount": 15,
        "realPriceBasisYearMonth": "202602"
    }
};

module.exports = mockData;
