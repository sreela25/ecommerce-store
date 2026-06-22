if(
    window.location.pathname.includes(
        "admin.html"
    )
    &&
    localStorage.getItem("role")
    !== "admin"
)
{
    window.location.href = "./products.html";
}

const publicPages =
[
    "index.html",
    "register.html"
];

const currentPage =
window.location.pathname.split("/").pop();

let allProducts = [];

if(
    !localStorage.getItem("token") &&
    !publicPages.includes(currentPage)
)
{
    window.location = "index.html";
}

async function register() {

    const name = document.getElementById("name").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const response = await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/auth/register",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })
        }
    );

    const data = await response.json();

    alert(data.message);

}

async function login() {

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const response = await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/auth/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data = await response.json();

    localStorage.setItem("token", data.token);

    localStorage.setItem(
        "userId",
        data.user._id
    );

    localStorage.setItem(
    "role",
    data.user.role
);

    alert("Login Successful");

    window.location = "products.html";
}

async function loadProducts() {

    const response = await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/products"
    );

    allProducts = await response.json();

    const products = allProducts;

    displayProducts(products);

}

function searchProducts()
{
    const text =
    document.getElementById("search")
    .value
    .toLowerCase();

    const filtered =
    allProducts.filter(product =>
        product.name
        .toLowerCase()
        .includes(text)
    );

    displayProducts(filtered);
}

function filterProducts()
{
    const category =
    document.getElementById(
        "categoryFilter"
    ).value;

    if(category === "All")
    {
        displayProducts(
            allProducts
        );

        return;
    }

    const filtered =
    allProducts.filter(
        product =>
        product.category ===
        category
    );

    displayProducts(
        filtered
    );
}

function displayProducts(products)
{
    let output = "";

    const isAdmin =
localStorage.getItem("role")
=== "admin";

    products.forEach(product => {

        output += `
        <div class="card">

            <img
            src="${product.image}"
            class="product-image">

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <p>
⭐ ${product.rating}
</p>

            <p>Rs. ${product.price}</p>

            <p class="${
product.stock <= 0
? 'out-stock'
: 'in-stock'
}">
${
product.stock <= 0
? '🔴 Out Of Stock'
: `🟢 In Stock (${product.stock})`
}
</p>

            ${product.stock > 0 ?

`
<button
onclick="addToCart('${product._id}')">
Add To Cart
</button>
`

:

`
<button disabled>
Out Of Stock
</button>
`
}

<select
onchange="rateProduct('${product._id}', this.value)">

<option value="1" ${product.rating == 1 ? "selected" : ""}>⭐ 1</option>

<option value="2" ${product.rating == 2 ? "selected" : ""}>⭐⭐ 2</option>

<option value="3" ${product.rating == 3 ? "selected" : ""}>⭐⭐⭐ 3</option>

<option value="4" ${product.rating == 4 ? "selected" : ""}>⭐⭐⭐⭐ 4</option>

<option value="5" ${product.rating == 5 ? "selected" : ""}>⭐⭐⭐⭐⭐ 5</option>

</select>

            ${isAdmin ? `

<button
onclick="deleteProduct('${product._id}')">
Delete
</button>

<button
onclick="editProduct('${product._id}')">
Edit
</button>

` : ""}
        </div>
        `;
    });

    document.getElementById("products").innerHTML =
    output;
}

async function rateProduct(id,rating)
{
    await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/products/rating/${id}`,
        {
            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
                rating
            })
        }
    );

    loadProducts();
}

function editProduct(id)
{
    const newPrice =
    prompt("Enter New Price");

    const newStock =
    prompt("Enter New Stock");

    if(!newPrice || !newStock)
    {
        return;
    }

    updateProduct(
        id,
        newPrice,
        newStock
    );
}

function sortProducts()
{
    const sort =
    document.getElementById(
        "sortFilter"
    ).value;

    let products =
    [...allProducts];

    if(sort === "low")
    {
        products.sort(
            (a,b) =>
            a.price - b.price
        );
    }

    else if(sort === "high")
    {
        products.sort(
            (a,b) =>
            b.price - a.price
        );
    }

    else if(sort === "az")
    {
        products.sort(
            (a,b) =>
            a.name.localeCompare(
                b.name
            )
        );
    }

    else if(sort === "za")
    {
        products.sort(
            (a,b) =>
            b.name.localeCompare(
                a.name
            )
        );
    }

    displayProducts(
        products
    );
}

async function updateProduct(
    id,
    price,
    stock
)
{
    await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/products/${id}`,
        {
            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
                price,
                stock
            })
        }
    );

    alert("Product Updated");

    loadProducts();
}

async function deleteProduct(id)
{

    const confirmDelete =
    confirm(
        "Are you sure?"
    );

    if(!confirmDelete)
    {
        return;
    }

    await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/products/${id}`,
        {
            method:"DELETE"
        }
    );

    alert(
        "Product Deleted"
    );

    loadProducts();

}

async function addToCart(productId) {

    const userId =
    localStorage.getItem("userId");

    const response = await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/cart",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userId,
                productId,
                quantity: 1
            })
        }
    );

    const data = await response.json();

    alert("Added To Cart");
}

async function loadCart() {

    const userId =
    localStorage.getItem("userId");

    const response = await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/cart/${userId}`
    );

    const items = await response.json();

    let total = 0;

    let output = "";

    if(items.length === 0)
{
    document.getElementById("cart").innerHTML = `
<div class="empty-cart">
    <h2>Your Cart is Empty</h2>
    <p>Add products to continue shopping.</p>
</div>
`;

    return;
}

    items.forEach(item => {
        total +=
item.productId.price *
item.quantity;
        output += `

<div class="card">

    <h3>Cart Item</h3>

    <h3>
    ${item.productId.name}
</h3>

<img
src="${item.productId.image}"
class="product-image">

<p>
    Price:
    Rs. ${item.productId.price}
</p>

    <div class="qty-box">

<button
onclick="updateQuantity('${item._id}', ${item.quantity - 1})">
-
</button>

<span>
${item.quantity}
</span>

<button
onclick="updateQuantity('${item._id}', ${item.quantity + 1})">
+
</button>

</div>

    <button
onclick="removeCartItem('${item._id}')"
class="delete-btn">
Remove
</button>

</div>

`;
    });

    output += `

<h2>
Total:
Rs. ${total}
</h2>

`;

    document.getElementById("cart").innerHTML =
    output;
}

async function updateQuantity(id, quantity)
{
    if(quantity < 1)
    {
        return;
    }

    await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/cart/${id}`,
        {
            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                quantity
            })
        }
    );

    loadCart();
}

async function loadDashboard()
{

    const usersResponse =
await fetch(
"https://ecommerce-store-backend-sklo.onrender.com/api/auth/users"
);

const users =
await usersResponse.json();

document.getElementById(
"userCount"
).innerText =
users.length;

    const productsResponse =
    await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/products"
    );

    const products =
    await productsResponse.json();

    document.getElementById(
        "productCount"
    ).innerText =
    products.length;

    const ordersResponse =
    await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/orders"
    );

    const orders =
    await ordersResponse.json();

    document.getElementById(
        "orderCount"
    ).innerText =
    orders.length;

    let revenue = 0;

    orders.forEach(order => {

        revenue +=
        order.totalAmount;

    });

    document.getElementById(
        "revenue"
    ).innerText =
    "Rs. " + revenue;
}

async function removeCartItem(id)
{
    await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/cart/${id}`,
        {
            method:"DELETE"
        }
    );

    alert("Item Removed");

    loadCart();
}

async function placeOrder() {

    const userId =
    localStorage.getItem("userId");

    const cartResponse = await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/cart/${userId}`
    );

    const cartItems =
    await cartResponse.json();

    let total = 0;

    cartItems.forEach(item => {
        total += item.productId.price * item.quantity;
    });

    const items = cartItems.map(item => ({
    productId: item.productId._id,
    quantity: item.quantity
}));

    const response = await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/orders",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userId,
                items,
                totalAmount: total
            })
        }
    );

    const data = await response.json();

if(!response.ok)
{
    alert(data.message);
    return;
}

alert("Order Placed");

window.location = "orders.html";

}

async function loadOrders() {

    const userId =
    localStorage.getItem("userId");

    const isAdmin =
    localStorage.getItem("role") === "admin";

    let response;

    if(isAdmin)
    {
        response = await fetch(
            "https://ecommerce-store-backend-sklo.onrender.com/api/orders"
        );
    }
    else
    {
        response = await fetch(
            `https://ecommerce-store-backend-sklo.onrender.com/api/orders/${userId}`
        );
    }

    const orders =
    await response.json();

    if(orders.length === 0)
    {
        document.getElementById("orders")
        .innerHTML =
        "<h2>No Orders Yet</h2>";

        return;
    }

    let output = "";

    orders.forEach(order => {

        output += `

<div class="order-card">

<h3>
Order #${order._id.slice(-5)}
</h3>

${isAdmin ? `
<p>
<b>User:</b>
${order.userId}
</p>
` : ""}

<p>
<b>Date:</b>
${new Date(order.createdAt)
.toLocaleDateString()}
</p>

<p>
<b>Total:</b>
Rs. ${order.totalAmount}
</p>

<p class="status-${order.status}">
<b>Status:</b>
${order.status}
</p>

${isAdmin ? `

<select
class="status-select"
onchange="
updateOrderStatus(
'${order._id}',
this.value
)">
<option
value="Pending"
${order.status==="Pending"?"selected":""}>
Pending
</option>

<option
value="Shipped"
${order.status==="Shipped"?"selected":""}>
Shipped
</option>

<option
value="Delivered"
${order.status==="Delivered"?"selected":""}>
Delivered
</option>

<option
value="Cancelled"
${order.status==="Cancelled"?"selected":""}>
Cancelled
</option>

</select>

` : ""}

</div>
<br>
`;
    });

    document.getElementById("orders")
    .innerHTML = output;
}

async function updateOrderStatus(id,status)
{
    await fetch(
        `https://ecommerce-store-backend-sklo.onrender.com/api/orders/${id}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                status
            })
        }
    );

    loadOrders();
}

async function loadRevenueChart()
{
    const response =
    await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/orders"
    );

    const orders =
    await response.json();

    const labels = [];
    const revenue = [];

    orders.forEach((order,index) => {

        labels.push(
            "Order " + (index + 1)
        );

        revenue.push(
            order.totalAmount
        );

    });

    const ctx =
    document.getElementById(
        "revenueChart"
    );

    new Chart(ctx, {

        type:"bar",

        data:{

            labels:labels,

            datasets:[{

                label:"Revenue",

                data:revenue

            }]
        }
    });
}

function logout()
{
    localStorage.clear();

    window.location = "index.html";
}

async function addProduct() {

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value;
    const stock = document.getElementById("stock").value;
    const image = document.getElementById("image").value;

if(
    !name ||
    !description ||
    !price ||
    !category ||
    !stock ||
    !image
)
{
    alert(
        "Please fill all fields"
    );

    return;
}

    const response = await fetch(
        "https://ecommerce-store-backend-sklo.onrender.com/api/products",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({
                name,
                description,
                price,
                category,
                stock,
                image
            })
        }
    );

    const data = await response.json();

    console.log(data);

    alert("Product Added Successfully");

    document.getElementById("name").value = "";
document.getElementById("description").value = "";
document.getElementById("price").value = "";
document.getElementById("category").value = "";
document.getElementById("stock").value = "";
document.getElementById("image").value = "";
}

if(window.location.pathname.includes("products.html"))
{
    loadProducts();
}

if(window.location.pathname.includes("cart.html"))
{
    loadCart();
}

if(window.location.pathname.includes("orders.html"))
{
    loadOrders();
}

if(
    window.location.pathname.includes(
        "admin.html"
    )
)
{
    loadDashboard();

    loadRevenueChart();
}

if(
    localStorage.getItem("role")
    !== "admin"
)
{
    const adminLink =
    document.getElementById(
        "adminLink"
    );

    if(adminLink)
    {
        adminLink.style.display =
        "none";
    }
}