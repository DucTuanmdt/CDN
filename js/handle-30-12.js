var app = new Vue({
    el: '#app',
    data: {
        cartWebX: [],
        order: {
            name: "",
            phone: "",
            address: "",
            note: "",
            total: 0
        },
        orderResult: false,
        isCreatingOrder: false,
    },
    computed: {
        enableOrder() {
            return this.order.name && this.order.phone && this.order.address;
        }
    },
    mounted() {
        this.initCart();
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
            alert("Đã thêm vào giỏ hàng!")
        },
        initCart() {
            this.cartWebX = JSON.parse(localStorage.getItem("cartWebX")) || [];
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
        }
    }
})