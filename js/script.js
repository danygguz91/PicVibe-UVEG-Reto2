const posts = [
  {
    id: 1,
    user: "alan.rm",
    location: "Ciudad de México",
    title: "Tarde entre edificios",
    caption: "Una caminata rápida y una vista que merecía quedarse guardada.",
    category: "ciudad",
    image: "img/ciudad.svg",
    avatar: "img/avatar-alan.svg"
  },
  {
    id: 2,
    user: "sofia.trips",
    location: "Valle de Bravo",
    title: "Fin de semana",
    caption: "Aire fresco, lago y una pausa del ritmo de la ciudad.",
    category: "viajes",
    image: "img/lago.svg",
    avatar: "img/avatar-sofia.svg"
  },
  {
    id: 3,
    user: "mau.foodie",
    location: "Coyoacán",
    title: "Algo dulce",
    caption: "Café, pan recién horneado y una mesa junto a la ventana.",
    category: "comida",
    image: "img/cafe.svg",
    avatar: "img/avatar-mau.svg"
  },
  {
    id: 4,
    user: "dani.green",
    location: "Desierto de los Leones",
    title: "Respirar un rato",
    caption: "Senderos, árboles y silencio. A veces eso es todo lo que hace falta.",
    category: "naturaleza",
    image: "img/bosque.svg",
    avatar: "img/avatar-dani.svg"
  },
  {
    id: 5,
    user: "alan.rm",
    location: "Santa Fe",
    title: "Luces después del trabajo",
    caption: "La ciudad cambia por completo cuando empiezan a encenderse las luces.",
    category: "ciudad",
    image: "img/noche.svg",
    avatar: "img/avatar-alan.svg"
  },
  {
    id: 6,
    user: "sofia.trips",
    location: "Tepoztlán",
    title: "Escapada de domingo",
    caption: "Montaña, color y un día sin prisa.",
    category: "viajes",
    image: "img/montana.svg",
    avatar: "img/avatar-sofia.svg"
  }
];

const favorites = new Set(JSON.parse(localStorage.getItem("picvibeFavorites") || "[]"));
let showOnlyFavorites = false;
let visiblePosts = [...posts];
let viewerIndex = 0;

const feed = document.getElementById("feed");
const stories = document.getElementById("stories");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const favoritesButton = document.getElementById("favoritesButton");
const randomButton = document.getElementById("randomButton");
const viewer = document.getElementById("viewer");
const viewerImage = document.getElementById("viewerImage");
const viewerUser = document.getElementById("viewerUser");
const viewerTitle = document.getElementById("viewerTitle");
const viewerCaption = document.getElementById("viewerCaption");
const viewerLike = document.getElementById("viewerLike");

function saveFavorites() {
  localStorage.setItem("picvibeFavorites", JSON.stringify([...favorites]));
}

function createStories() {
  const uniqueUsers = [...new Map(posts.map(post => [post.user, post])).values()];
  stories.innerHTML = uniqueUsers.map(post => `
    <button class="story" type="button" data-user="${post.user}" aria-label="Ver publicaciones de ${post.user}">
      <span class="story-ring"><img src="${post.avatar}" alt=""></span>
      <span>${post.user}</span>
    </button>
  `).join("");

  stories.querySelectorAll(".story").forEach(button => {
    button.addEventListener("click", () => {
      searchInput.value = button.dataset.user;
      applyFilters();
      document.getElementById("feedTitle").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderPosts() {
  feed.innerHTML = visiblePosts.map((post, index) => `
    <article class="post">
      <div class="post-header">
        <img class="avatar" src="${post.avatar}" alt="Avatar de ${post.user}">
        <div>
          <p class="post-user">${post.user}</p>
          <p class="post-location">${post.location}</p>
        </div>
      </div>
      <div class="post-image-wrap" data-index="${index}" tabindex="0" role="button" aria-label="Abrir ${post.title}">
        <img class="post-image" src="${post.image}" alt="${post.title}">
        <span class="category-chip">${post.category}</span>
      </div>
      <div class="post-actions">
        <button class="like-button ${favorites.has(post.id) ? "active" : ""}" type="button" data-id="${post.id}" aria-label="${favorites.has(post.id) ? "Quitar de favoritos" : "Agregar a favoritos"}">${favorites.has(post.id) ? "♥" : "♡"}</button>
        <button class="open-button" type="button" data-index="${index}">Ver imagen</button>
      </div>
      <div class="post-copy">
        <p><strong>${post.user}</strong> ${post.caption}</p>
      </div>
    </article>
  `).join("");

  resultCount.textContent = `${visiblePosts.length} ${visiblePosts.length === 1 ? "imagen" : "imágenes"}`;
  emptyState.hidden = visiblePosts.length !== 0;

  feed.querySelectorAll(".like-button").forEach(button => {
    button.addEventListener("click", () => toggleFavorite(Number(button.dataset.id)));
  });

  feed.querySelectorAll(".open-button, .post-image-wrap").forEach(element => {
    const open = () => openViewer(Number(element.dataset.index));
    element.addEventListener("click", open);
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") open();
    });
  });
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  visiblePosts = posts.filter(post => {
    const searchable = `${post.user} ${post.location} ${post.title} ${post.caption}`.toLowerCase();
    const matchesQuery = searchable.includes(query);
    const matchesCategory = category === "all" || post.category === category;
    const matchesFavorite = !showOnlyFavorites || favorites.has(post.id);
    return matchesQuery && matchesCategory && matchesFavorite;
  });

  renderPosts();
}

function toggleFavorite(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);

  saveFavorites();
  applyFilters();

  const currentPost = visiblePosts[viewerIndex];
  if (!viewer.hidden && currentPost) updateViewerLike(currentPost.id);
}

function updateViewerLike(id) {
  const liked = favorites.has(id);
  viewerLike.textContent = liked ? "♥" : "♡";
  viewerLike.classList.toggle("active", liked);
  viewerLike.setAttribute("aria-label", liked ? "Quitar de favoritos" : "Agregar a favoritos");
}

function openViewer(index) {
  viewerIndex = index;
  updateViewer();
  viewer.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  viewer.hidden = true;
  document.body.style.overflow = "";
}

function updateViewer() {
  if (!visiblePosts.length) return;
  const post = visiblePosts[viewerIndex];
  viewerImage.src = post.image;
  viewerImage.alt = post.title;
  viewerUser.textContent = `@${post.user} · ${post.location}`;
  viewerTitle.textContent = post.title;
  viewerCaption.textContent = post.caption;
  updateViewerLike(post.id);
}

function moveViewer(direction) {
  if (!visiblePosts.length) return;
  viewerIndex = (viewerIndex + direction + visiblePosts.length) % visiblePosts.length;
  updateViewer();
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

favoritesButton.addEventListener("click", () => {
  showOnlyFavorites = !showOnlyFavorites;
  favoritesButton.setAttribute("aria-pressed", String(showOnlyFavorites));
  favoritesButton.textContent = showOnlyFavorites ? "♥ Mostrando favoritos" : "♡ Ver favoritos";
  applyFilters();
});

randomButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  showOnlyFavorites = false;
  favoritesButton.setAttribute("aria-pressed", "false");
  favoritesButton.textContent = "♡ Ver favoritos";
  visiblePosts = [...posts];
  renderPosts();
  openViewer(Math.floor(Math.random() * visiblePosts.length));
});

document.getElementById("closeViewer").addEventListener("click", closeViewer);
document.getElementById("prevImage").addEventListener("click", () => moveViewer(-1));
document.getElementById("nextImage").addEventListener("click", () => moveViewer(1));
viewerLike.addEventListener("click", () => {
  const post = visiblePosts[viewerIndex];
  if (post) toggleFavorite(post.id);
});

viewer.addEventListener("click", event => {
  if (event.target === viewer) closeViewer();
});

document.addEventListener("keydown", event => {
  if (viewer.hidden) return;
  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowLeft") moveViewer(-1);
  if (event.key === "ArrowRight") moveViewer(1);
});

createStories();
applyFilters();
