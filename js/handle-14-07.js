const defaultOptions = {
    position: "top-center",
    duration: 4000,
    singleton: true,
};

Vue.use(Toasted, defaultOptions);

var appHeader = new Vue({
    el: '#app-header',
    data: {
        user: {}
    },
    mounted() {
        this.user = this.getUserFromCookies();
    },
    methods: {
        logout() {
            Cookies.remove("user_y");
            Cookies.remove("token_y");
            location.href = "/login";
        },
        getUserFromCookies() {
            let user = null;
            try {
                user = JSON.parse(Cookies.get("user_y"));
            } catch (e) {
                console.error("Can not get user from cookies", e)
            }
            return user;
        },
    }
})

var app = new Vue({
    el: '#app',
    data: {
        cartWebX: [],
        order: {
            user: "",
            address: "",
            note: "",
            total: 0
        },
        orderResult: false,
        isCreatingOrder: false,
        support: {},
        mapPlace: null,
        user: {
            name: "",
            phone: "",
            email: "",
        },
    },
    computed: {
        enableOrder() {
            return this.user && this.user._id && this.order.address;
        }
    },
    mounted() {
        this.initCart();
        this.initSupport();
        this.checkInitMap();
    },
    watch: {
        cartWebX: {
            deep: true,
            handler() {
                console.log("CHANGED", this.cartWebX);
                this.order.total = this.calculateCartTotal();
                if (this.cartWebX) {
                    localStorage.setItem("cartWebX", JSON.stringify(this.cartWebX));
                }
            }
        }
    },
    methods: {
        addToCart(originProduct) {
            let product = {
                _id: null
            };
            // add to cart by params (use in product page)
            if (originProduct && originProduct._id && originProduct.price) { // ensura that originProduct is not event
                product = originProduct;
            } else {
                // add to cart by ref, use in product detail page
                try {
                    product = {
                        _id: this.$refs.productId.value,
                        name: this.$refs.productName.value,
                        price: this.$refs.productPrice.value,
                        quantity: this.$refs.productQuantity.value,
                        thumbnail: this.$refs.productThumbnail.value
                    }
                } catch (e) {
                    console.log("Can not add to cart!", e)
                }
            }

            try {
                product.price = parseInt(product.price)
                product.quantity = parseInt(product.quantity)
            } catch (e) {
                connsole.log("Can not convert product!", e)
            }
            console.table(product)
            const cartWebX = JSON.parse(localStorage.getItem("cartWebX")) || [];
            if (cartWebX.find(item => item._id == product._id)) {
                // update
                const oldIndex = cartWebX.findIndex(item => item._id == product._id);
                cartWebX[oldIndex].quantity += product.quantity

            } else {
                // add
                cartWebX.push(product);
            }
            console.log("CART: ", cartWebX)
            localStorage.setItem("cartWebX", JSON.stringify(cartWebX))
            this.$toasted.show(`Đã thêm vào giỏ hàng!`);
        },
        initCart() {
            this.user = {
                ...this.user,
                ...this.getUserFromCookies()
            };
            if (this.user && this.user._id) {
                this.order.user = this.user._id;
            };
            this.cartWebX = JSON.parse(localStorage.getItem("cartWebX")) || [];
        },
        initSupport() {
            this.support = {
                name: "",
                phone: null,
                email: "",
                question: ""
            };
        },
        calculateCartTotal() {
            if (this.cartWebX && this.cartWebX.length) {
                let total = 0;
                this.cartWebX.map(item => {
                    total += item.price * item.quantity;
                });
                return total;
            }
            return 0;
        },
        formatCurrency(value) {
            if (value && typeof value == "number")
                return value.toLocaleString("it-IT", {
                    style: "currency",
                    currency: "VND"
                });
            return value;
        },
        removeItemInCart(productId) {
            if (this.cartWebX && this.cartWebX.length) {
                const index = this.cartWebX.findIndex(item => item._id == productId);
                if (index >= 0) {
                    this.cartWebX.splice(index, 1);
                }
            }
        },
        async createOrder() {
            const order = {
                order: {
                    ...this.order
                },
                items: this.cartWebX
            };
            this.isCreatingOrder = true;
            try {
                const res = await axios.post(
                    "/api/order/create",
                    order
                );
                if (res.data.code == 200) {
                    this.cartWebX = [];
                    this.orderResult = true;
                } else {
                    this.orderResult = false;
                    console.log("RES: ", res)
                }
            } catch (e) {
                this.orderResult = false;
                console.log("Error: ", e)
            }
            this.$refs.buttonModal.click();
            this.isCreatingOrder = false;
        },
        async submitQuestion() {
            try {
                const res = await axios.post("/api/support/create", this.support);
                if (res.data.code == 200) {
                    this.initSupport();
                    console.log("RES", res);
                    this.$toasted.show(`Yêu cầu của bạn đã được gửi đi`);
                } else {
                    console.log("Fail: ", res);
                }
            } catch (e) {
                console.log("Error: ", e);
            }
        },
        checkInitMap() {
            if (this.$refs.mapData) {
                try {
                    this.mapPlace = JSON.parse(this.$refs.mapData.getAttribute("value"));
                    if (this.mapPlace) {
                        this.initMap();
                    }
                } catch (e) {
                    console.log("No Map", e)
                }
            }

        },
        initMap() {
            if (!google) {
                setTimeout(() => {
                    this.initMap();
                }, 3000)
            }

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: this.mapPlace.geometry.location
            });

            var marker = new google.maps.Marker({
                position: this.mapPlace.geometry.location,
                map: map,
                title: this.mapPlace.formatted_address
            });
        },

        getUserFromCookies() {
            let user = null;
            try {
                user = JSON.parse(Cookies.get("user_y"));
            } catch (e) {
                console.error("Can not get user from cookies", e)
            }
            return user;
        },
    }
})