// E-bebek Ürün Carousel Uygulaması
(function() {
    // Sabit değişkenler
    const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
    const CAROUSEL_TITLE = 'Beğenebileceğinizi düşündüklerimiz';
    const STORAGE_KEY = 'favoriteProducts'; // Favori ürünlerin localStorage'daki anahtarı
    const STORAGE_PRODUCTS_KEY = 'cachedProducts'; // Önbelleğe alınmış ürünlerin localStorage'daki anahtarı
    // Varsayılan resim (1x1 şeffaf piksel)
    const DEFAULT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    // Ana sayfada mıyız kontrol et
    if (!window.location.pathname.endsWith('/')) {
        console.log('wrong page');
        return;
    }

    // Yardımcı fonksiyonlar
    // Favori ürünleri localStorage'dan al
    const getFavorites = () => {
        const favorites = localStorage.getItem(STORAGE_KEY);
        return favorites ? JSON.parse(favorites) : [];
    };

    // Favori ürünleri localStorage'a kaydet
    const saveFavorites = (favorites) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    };

    // Favori ürün ekleme/çıkarma işlemi
    const toggleFavorite = (productId) => {
        const favorites = getFavorites();
        const index = favorites.indexOf(productId);
        
        if (index === -1) {
            favorites.push(productId);
        } else {
            favorites.splice(index, 1);
        }
        
        saveFavorites(favorites);
    };

    // İndirim yüzdesini hesapla
    const calculateDiscount = (originalPrice, currentPrice) => {
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    };

    // CSS stillerini oluştur ve sayfaya ekle
    const injectStyles = () => {
        const styles = `
            .product-carousel {
                margin: 20px 0;
                padding: 0 20px;
                position: relative;
                z-index: 1;
                background: #fff;
                width: 100%;
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .carousel-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #333;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            .carousel-container {
                position: relative;
                overflow: hidden;
                padding: 0 40px;
            }
            
            .carousel-track {
                display: flex;
                transition: transform 0.3s ease;
                gap: 15px;
            }
            
            .carousel-item {
                flex: 0 0 200px;
                position: relative;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            }
            
            .carousel-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .product-image-container {
                position: relative;
                width: 100%;
                height: 200px;
                background: #f8f8f8;
                border-radius: 8px 8px 0 0;
                overflow: hidden;
            }
            
            .product-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 8px 8px 0 0;
                cursor: pointer;
                background: #fff;
                transition: transform 0.3s ease;
            }
            
            .product-image:hover {
                transform: scale(1.05);
            }
            
            .favorite-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 2;
                transition: transform 0.2s ease;
            }
            
            .favorite-button:hover {
                transform: scale(1.1);
            }
            
            .favorite-button svg {
                width: 20px;
                height: 20px;
                fill: #ccc;
                transition: fill 0.2s ease;
            }
            
            .favorite-button.active svg {
                fill: #ff6b00;
            }
            
            .product-info {
                padding: 12px;
                background: #fff;
                border-radius: 0 0 8px 8px;
            }
            
            .product-title {
                font-size: 14px;
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                color: #333;
                line-height: 1.4;
                height: 40px;
            }
            
            .product-price {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .current-price {
                font-weight: bold;
                color: #ff6b00;
                font-size: 16px;
            }
            
            .original-price {
                text-decoration: line-through;
                color: #999;
                font-size: 14px;
            }
            
            .discount-badge {
                background: #ff6b00;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .carousel-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 40px;
                height: 40px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.2s ease;
            }
            
            .carousel-nav:hover {
                background: #f8f8f8;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .carousel-prev {
                left: 0;
            }
            
            .carousel-next {
                right: 0;
            }
            
            @media (max-width: 768px) {
                .product-carousel {
                    padding: 0 10px;
                }
                
                .carousel-container {
                    padding: 0 30px;
                }
                
                .carousel-item {
                    flex: 0 0 150px;
                }
                
                .product-image-container {
                    height: 150px;
                }
                
                .product-title {
                    font-size: 13px;
                    height: 36px;
                }
                
                .current-price {
                    font-size: 14px;
                }
                
                .original-price {
                    font-size: 12px;
                }
                
                .discount-badge {
                    font-size: 11px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    };

    // Carousel HTML yapısını oluştur
    const createCarousel = () => {
        const carousel = document.createElement('div');
        carousel.className = 'product-carousel';
        
        carousel.innerHTML = `
            <h2 class="carousel-title">${CAROUSEL_TITLE}</h2>
            <div class="carousel-container">
                <button class="carousel-nav carousel-prev">←</button>
                <div class="carousel-track"></div>
                <button class="carousel-nav carousel-next">→</button>
            </div>
        `;
        
        // Stories bölümünü bul ve carousel'i ondan sonra ekle
        const storiesSection = document.querySelector('.stories-section');
        if (storiesSection) {
            storiesSection.parentNode.insertBefore(carousel, storiesSection.nextSibling);
        } else {
            // Stories bölümü bulunamazsa, ana içeriğe ekle
            const mainContent = document.querySelector('main') || document.body;
            mainContent.appendChild(carousel);
        }
        
        return carousel;
    };

    // Ürün kartı oluştur
    const createProductCard = (product) => {
        // Ürün verisi kontrolü
        if (!product || typeof product !== 'object') {
            console.error('Invalid product data:', product);
            return null;
        }

        const favorites = getFavorites();
        const isFavorite = favorites.includes(product.id);
        
        const card = document.createElement('div');
        card.className = 'carousel-item';
        
        // Ürün URL'sini kontrol et
        const productUrl = product.url || `https://www.e-bebek.com/p/${product.id}`;
        
        // Fiyatı TL formatında göster
        const formatPrice = (price) => {
            return typeof price === 'number' ? `${price.toFixed(2)} TL` : '0.00 TL';
        };

        // Resim yükleme hatası durumunda
        const handleImageError = (img) => {
            img.onerror = null; // Sonsuz döngüyü engelle
            img.src = DEFAULT_IMAGE;
            img.style.backgroundColor = '#f8f8f8';
        };
        
        // Ürün kartı HTML'i
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image || DEFAULT_IMAGE}" 
                     alt="${product.title || 'Product'}" 
                     class="product-image"
                     onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'; this.style.backgroundColor='#f8f8f8';">
            </div>
            <button class="favorite-button ${isFavorite ? 'active' : ''}" data-product-id="${product.id}">
                <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </button>
            <div class="product-info">
                <h3 class="product-title">${product.title || 'Product Title'}</h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.original_price > product.price ? `
                        <span class="original-price">${formatPrice(product.original_price)}</span>
                        <span class="discount-badge">%${calculateDiscount(product.original_price, product.price)}</span>
                    ` : ''}
                </div>
            </div>
        `;

        // Resim yükleme hatası kontrolü
        const img = card.querySelector('.product-image');
        if (img) {
            img.addEventListener('error', () => handleImageError(img));
        }
        
        // Tıklama olayları
        const favoriteButton = card.querySelector('.favorite-button');
        if (favoriteButton) {
            favoriteButton.addEventListener('click', (e) => {
                e.preventDefault();
                const button = e.currentTarget;
                button.classList.toggle('active');
                toggleFavorite(product.id);
            });
        }
        
        const productImage = card.querySelector('.product-image');
        if (productImage) {
            productImage.addEventListener('click', () => {
                if (productUrl) {
                    window.open(productUrl, '_blank');
                }
            });
        }
        
        return card;
    };

    // Carousel navigasyon ayarları
    const setupCarouselNavigation = (carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const prevButton = carousel.querySelector('.carousel-prev');
        const nextButton = carousel.querySelector('.carousel-next');
        
        let currentPosition = 0;
        const itemWidth = 215; // 200px genişlik + 15px margin
        
        // Pozisyonu güncelle
        const updatePosition = () => {
            track.style.transform = `translateX(${currentPosition}px)`;
        };
        
        // Önceki buton tıklama olayı
        prevButton.addEventListener('click', () => {
            currentPosition = Math.min(currentPosition + itemWidth, 0);
            updatePosition();
        });
        
        // Sonraki buton tıklama olayı
        nextButton.addEventListener('click', () => {
            const maxPosition = -(track.scrollWidth - track.parentElement.offsetWidth);
            currentPosition = Math.max(currentPosition - itemWidth, maxPosition);
            updatePosition();
        });
    };

    // Ana başlatma fonksiyonu
    const init = async () => {
        try {
            // Stilleri ekle
            injectStyles();
            // Carousel'i oluştur
            const carousel = createCarousel();
            const track = carousel.querySelector('.carousel-track');
            
            // Önce localStorage'dan ürünleri almayı dene
            let products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS_KEY));
            
            if (!products) {
                // localStorage'da yoksa API'den al
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                products = await response.json();
                
                // Ürün verisi kontrolü
                if (!Array.isArray(products)) {
                    throw new Error('Invalid products data format');
                }
                
                // Ürünleri localStorage'a kaydet
                localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
            }
            
            // Ürün kartlarını oluştur ve ekle
            products.forEach(product => {
                const card = createProductCard(product);
                if (card) {
                    track.appendChild(card);
                }
            });
            
            // Navigasyonu ayarla
            setupCarouselNavigation(carousel);
        } catch (error) {
            console.error('Error initializing carousel:', error);
        }
    };

    // Carousel'i başlat
    init();
})(); 