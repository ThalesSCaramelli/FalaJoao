// Service Worker — cache do app shell pra funcionar offline.
// Bump o CACHE_NAME sempre que mudar algum arquivo do shell (força atualização nos aparelhos).
const CACHE_NAME = "meu-ingles-v13";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./data.js",
  "./engine.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/fonts/baloo2-latin.woff2",
  "./assets/fonts/baloo2-latin-ext.woff2",
  "./assets/fonts/nunito-latin.woff2",
  "./assets/fonts/nunito-latin-ext.woff2",
];

const AUDIO_SHELL = [
  "./assets/audio/en/animals_bear.mp3",
  "./assets/audio/en/animals_bird.mp3",
  "./assets/audio/en/animals_cat.mp3",
  "./assets/audio/en/animals_dog.mp3",
  "./assets/audio/en/animals_duck.mp3",
  "./assets/audio/en/animals_elephant.mp3",
  "./assets/audio/en/animals_fish.mp3",
  "./assets/audio/en/animals_frog.mp3",
  "./assets/audio/en/animals_lion.mp3",
  "./assets/audio/en/animals_rabbit.mp3",
  "./assets/audio/en/body_ear.mp3",
  "./assets/audio/en/body_eyes.mp3",
  "./assets/audio/en/body_foot.mp3",
  "./assets/audio/en/body_hair.mp3",
  "./assets/audio/en/body_hand.mp3",
  "./assets/audio/en/body_mouth.mp3",
  "./assets/audio/en/body_nose.mp3",
  "./assets/audio/en/body_tooth.mp3",
  "./assets/audio/en/clothes_hat.mp3",
  "./assets/audio/en/clothes_jacket.mp3",
  "./assets/audio/en/clothes_pants.mp3",
  "./assets/audio/en/clothes_shirt.mp3",
  "./assets/audio/en/clothes_shoes.mp3",
  "./assets/audio/en/clothes_socks.mp3",
  "./assets/audio/en/colors_black.mp3",
  "./assets/audio/en/colors_blue.mp3",
  "./assets/audio/en/colors_brown.mp3",
  "./assets/audio/en/colors_green.mp3",
  "./assets/audio/en/colors_orange.mp3",
  "./assets/audio/en/colors_pink.mp3",
  "./assets/audio/en/colors_purple.mp3",
  "./assets/audio/en/colors_red.mp3",
  "./assets/audio/en/colors_white.mp3",
  "./assets/audio/en/colors_yellow.mp3",
  "./assets/audio/en/combo_black_cat.mp3",
  "./assets/audio/en/combo_blue_shoes.mp3",
  "./assets/audio/en/combo_brown_bear.mp3",
  "./assets/audio/en/combo_green_shirt.mp3",
  "./assets/audio/en/combo_i_like_cats.mp3",
  "./assets/audio/en/combo_i_like_dogs.mp3",
  "./assets/audio/en/combo_i_want_milk.mp3",
  "./assets/audio/en/combo_i_want_water.mp3",
  "./assets/audio/en/combo_orange_fish.mp3",
  "./assets/audio/en/combo_purple_grapes.mp3",
  "./assets/audio/en/combo_red_apple.mp3",
  "./assets/audio/en/combo_thank_you_dad.mp3",
  "./assets/audio/en/combo_thank_you_mom.mp3",
  "./assets/audio/en/combo_white_rabbit.mp3",
  "./assets/audio/en/combo_yellow_banana.mp3",
  "./assets/audio/en/family_baby.mp3",
  "./assets/audio/en/family_brother.mp3",
  "./assets/audio/en/family_dad.mp3",
  "./assets/audio/en/family_grandma.mp3",
  "./assets/audio/en/family_grandpa.mp3",
  "./assets/audio/en/family_mom.mp3",
  "./assets/audio/en/family_sister.mp3",
  "./assets/audio/en/food_apple.mp3",
  "./assets/audio/en/food_banana.mp3",
  "./assets/audio/en/food_bread.mp3",
  "./assets/audio/en/food_cheese.mp3",
  "./assets/audio/en/food_cookie.mp3",
  "./assets/audio/en/food_egg.mp3",
  "./assets/audio/en/food_grapes.mp3",
  "./assets/audio/en/food_milk.mp3",
  "./assets/audio/en/food_orange.mp3",
  "./assets/audio/en/food_water.mp3",
  "./assets/audio/en/numbers_eight.mp3",
  "./assets/audio/en/numbers_five.mp3",
  "./assets/audio/en/numbers_four.mp3",
  "./assets/audio/en/numbers_nine.mp3",
  "./assets/audio/en/numbers_one.mp3",
  "./assets/audio/en/numbers_seven.mp3",
  "./assets/audio/en/numbers_six.mp3",
  "./assets/audio/en/numbers_ten.mp3",
  "./assets/audio/en/numbers_three.mp3",
  "./assets/audio/en/numbers_two.mp3",
  "./assets/audio/en/phrase_bathroom_please.mp3",
  "./assets/audio/en/phrase_can_i_borrow.mp3",
  "./assets/audio/en/phrase_can_i_have_this.mp3",
  "./assets/audio/en/phrase_dont_understand.mp3",
  "./assets/audio/en/phrase_excuse_me.mp3",
  "./assets/audio/en/phrase_help_please.mp3",
  "./assets/audio/en/phrase_hungry.mp3",
  "./assets/audio/en/phrase_im_hurt.mp3",
  "./assets/audio/en/phrase_lets_play.mp3",
  "./assets/audio/en/phrase_my_turn.mp3",
  "./assets/audio/en/phrase_play_with_you.mp3",
  "./assets/audio/en/phrase_see_you_later.mp3",
  "./assets/audio/en/phrase_thirsty.mp3",
  "./assets/audio/en/phrase_water_please.mp3",
  "./assets/audio/en/phrase_whats_this.mp3",
  "./assets/audio/en/phrase_your_name.mp3",
  "./assets/audio/en/phrase_your_turn.mp3",
  "./assets/audio/en/school_backpack.mp3",
  "./assets/audio/en/school_ball.mp3",
  "./assets/audio/en/school_book.mp3",
  "./assets/audio/en/school_chair.mp3",
  "./assets/audio/en/school_crayon.mp3",
  "./assets/audio/en/school_glue.mp3",
  "./assets/audio/en/school_pencil.mp3",
  "./assets/audio/en/school_scissors.mp3",
  "./assets/audio/en/shapes_circle.mp3",
  "./assets/audio/en/shapes_diamond.mp3",
  "./assets/audio/en/shapes_heart.mp3",
  "./assets/audio/en/shapes_square.mp3",
  "./assets/audio/en/shapes_star.mp3",
  "./assets/audio/en/shapes_triangle.mp3",
  "./assets/audio/en/survival_bathroom.mp3",
  "./assets/audio/en/survival_bye_bye.mp3",
  "./assets/audio/en/survival_go_to_the_bathroom.mp3",
  "./assets/audio/en/survival_hello.mp3",
  "./assets/audio/en/survival_help.mp3",
  "./assets/audio/en/survival_my_name_is.mp3",
  "./assets/audio/en/survival_no.mp3",
  "./assets/audio/en/survival_please.mp3",
  "./assets/audio/en/survival_thank_you.mp3",
  "./assets/audio/en/survival_water.mp3",
  "./assets/audio/en/survival_yes.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL.concat(AUDIO_SHELL))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first pro app shell, com atualização em segundo plano pra conteúdo novo (mesma origem).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
