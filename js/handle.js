var app = new Vue({
    el: '#app',
    data: {
        message: null
    },
    mounted() {
        const cartWebX = localStorage.getItem("cartWebX")
        console.log("Init cart", JSON.parse(cartWebX))
    },
    methods: {
        show(data) {
            alert(data)
        },
        addToCart(_id) {
            const product = {
                _id: this.$refs.productId.value,
                name: this.$refs.productName.value,
                price: this.$refs.productPrice.value,
                quantity: this.$refs.productQuantity.value,
                thumbnail: this.$refs.productThumbnail.value
            }
            try {
                product.price = parseInt(product.price)
                product.quantity = parseInt(product.quantity)
            } catch (e) {
                connsole.log("Can not convert product!", e)
            }
            console.table(product)
            const cartWebX = JSON.parse(localStorage.getItem("cartWebX")) || [];
            console.log("before add", cartWebX)
            if (cartWebX.find(item => item._id == product._id)) {
                // update
                console.log("UPDATE")
                const oldIndex = cartWebX.findIndex(item => item._id == product._id);
                console.log("Index", oldIndex)
                cartWebX[oldIndex].quantity += product.quantity

            } else {
                console.log("ADD")
                // add
                cartWebX.push(product);
            }
            console.log("CART: ", cartWebX)
            localStorage.setItem("cartWebX", JSON.stringify(cartWebX))
            alert("Đã thêm vào giỏ hàng!")
        }
    }
})