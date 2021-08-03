import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/session",
    name: "Session",
    component: () =>
      import(/* webpackChunkName: "session" */ "@/views/Session.vue"),
  },
  {
    path: "/matches",
    name: "Matches",
    component: () =>
      import(/* webpackChunkName: "session" */ "@/views/Matches.vue"),
  },
  {
    path: "/history",
    name: "History",
    component: () =>
      import(/* webpackChunkName: "session" */ "@/views/History.vue"),
  },

  { path: "*", component: Home },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;
