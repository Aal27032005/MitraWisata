Wahai AI Agent, saya sudah mengumpulkan daftar URL gambar asli dan akurat untuk 15 katalog destinasi utama aplikasi kita. Tolong mutakhirkan total isi file `scripts/seed-wisata.mjs` menggunakan data terbaru ini. 

Gunakan item pertama dari setiap daftar sebagai properti `foto_url` (gambar utama), lalu masukkan sisanya (serta kombinasi gambar utama sebagai variasi) ke dalam array `foto_urls` agar setiap katalog memiliki total 5-6 foto galeri pendukung yang melimpah dan menakjubkan. 

Berikut adalah struktur objek `wisataData` yang harus kamu tulis ulang:

const wisataData = [
  {
    nama: "Nusa Penida Bali",
    deskripsi: "Pulau dengan tebing laut spektakuler, pantai tersembunyi, dan spot foto populer di dunia seperti Kelingking Beach, Angel's Billabong, dan Broken Beach yang memukau mata.",
    lokasi: "Klungkung, Bali",
    harga: 450000,
    foto_url: "https://a.cdn-hotels.com/gdcs/production51/d1983/1a7e2818-045b-4fcc-973c-6d5f63a523ec.jpg",
    foto_urls: [
      "https://a.cdn-hotels.com/gdcs/production51/d1983/1a7e2818-045b-4fcc-973c-6d5f63a523ec.jpg",
      "https://theworldpursuit.com/wp-content/uploads/2018/09/Nusa-Penida1.jpg",
      "https://tse2.mm.bing.net/th/id/OIP.DzUKe9MguF2_5P2_ybV3UgHaGe?r=0&w=1392&h=1218&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://thumbs.dreamstime.com/b/hindu-temple-nusa-penida-indonesia-one-76688719.jpg",
      "https://www.civitatis.com/f/indonesia/bali/excursion-nusa-penida-snorkel-r32.jpg"
    ]
  },
  {
    nama: "Gunung Rinjani",
    deskripsi: "Menjulang sepanjang setengah dari utara lombok, Gunung Rinjani (3726m) adalah gunung berapi tertinggi kedua di Indonesia. Rinjani memiliki nilai spiritual yang tinggi dan menawarkan gugus awan yang indah seakan begitu dekat dengan langit di puncaknya.",
    lokasi: "Lombok, Nusa Tenggara Barat",
    harga: 1350000,
    foto_url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/39/a9/d2.jpg",
    foto_urls: [
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/39/a9/d2.jpg",
      "https://hikingrinjani.com/wp-content/uploads/2018/04/summit-mount-rinjani2.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/72/e9/0c/caption.jpg?w=800&h=600&s=1",
      "https://www.tripsavvy.com/thmb/KST2o8JptpGtShngNTUbvvITj5I=/2120x1414/filters:fill(auto,1)/GettyImages-498839091-5887fd623df78c2ccdd246d3.jpg",
      "https://wallpapercave.com/wp/wp9829653.jpg"
    ]
  },
  {
    nama: "Kepulauan Karimunjawa",
    deskripsi: "Tersembunyi di Laut Jawa, taman nasional laut yang dilindungi ini memiliki 27 pulau asri yang menawarkan terumbu karang sehat, pantai pasir putih bersih, serta pengalaman berenang bersama penyu langsung dari permukaan air.",
    lokasi: "Jepara, Jawa Tengah",
    harga: 950000,
    foto_url: "https://images.squarespace-cdn.com/content/v1/6298cb774cf3830bc9b342bf/2b81ea22-0b34-49a5-832d-9a041325a785/sunset-beach-karimunjawa-island.jpg?format=1000w",
    foto_urls: [
      "https://images.squarespace-cdn.com/content/v1/6298cb774cf3830bc9b342bf/2b81ea22-0b34-49a5-832d-9a041325a785/sunset-beach-karimunjawa-island.jpg?format=1000w",
      "https://tse1.mm.bing.net/th/id/OIP.65MOHwHx-MH2h3ZSX_cNbwHaE9?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://coconut-story.com/wp-content/uploads/2023/02/plage-karimunjawa-6-1920x1080.jpg",
      "https://tse2.mm.bing.net/th/id/OIP.kOeYvF1myfvBSrsZhpe8QAHaFN?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://blue.kumparan.com/image/upload/fl_progressive,fl_lossy,c_fill,q_auto:best,w_640/v1634025439/01gcfz7dxvnay6vq5wm4wa6tbv.jpg",
      "https://jejakpiknik.com/wp-content/uploads/2018/05/karimunjawa-2-630x380.jpg"
    ]
  },
  {
    nama: "Mandalika Lombok",
    deskripsi: "Kawasan wisata pesisir modern dengan pantai pasir putih, bukit hijau, budaya Sasak, dan area sport tourism internasional yang menaungi sirkuit balap kelas dunia.",
    lokasi: "Lombok Tengah, Nusa Tenggara Barat",
    harga: 600000,
    foto_url: "https://static.vecteezy.com/system/resources/previews/010/967/887/non_2x/the-beauty-of-the-tropical-beach-of-mandalika-lombok-west-nusa-tenggara-indonesia-free-photo.jpg",
    foto_urls: [
      "https://static.vecteezy.com/system/resources/previews/010/967/887/non_2x/the-beauty-of-the-tropical-beach-of-mandalika-lombok-west-nusa-tenggara-indonesia-free-photo.jpg",
      "https://static.vecteezy.com/system/resources/previews/010/099/967/large_2x/the-beauty-of-the-mandalika-beach-on-the-island-of-lombok-indonesia-free-photo.jpg",
      "https://www.katiecaftravel.com/wp-content/uploads/2023/12/seger_beach_kuta_lombok_sunset-2-1024x768.jpg",
      "https://blmtour.com/wp-content/uploads/2022/03/Mandalika.png",
      "https://tse4.mm.bing.net/th/id/OIP.c4BqKgagXiPx5NdCrNKTRgHaEL?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://blog.tripcetera.com/id/wp-content/uploads/2020/02/jerryhomola_57358347_291668985093920_8355833383918431424_n-1024x1024.jpg"
    ]
  },
  {
    nama: "Ubud Bali",
    deskripsi: "Ubud adalah pusat seni, budaya, wellness, dan alam hijau Bali yang menghadirkan suasana tenang sekaligus berkelas. Wisatawan dapat menikmati sawah terasering, galeri seni, pura tradisional, hutan monyet, kelas yoga, kuliner sehat, hingga pengalaman menginap bernuansa tropis.",
    lokasi: "Gianyar, Bali",
    harga: 700000,
    foto_url: "https://www.holidify.com/images/cmsuploads/compressed/1_pura_tanah_lot2_20180919160330.jpg",
    foto_urls: [
      "https://www.holidify.com/images/cmsuploads/compressed/1_pura_tanah_lot2_20180919160330.jpg",
      "https://static.wixstatic.com/media/2a4bc4_22d29122b596435d9bc2ddf55bf4ddd2~mv2.jpg/v1/fill/w_980,h_1225,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2a4bc4_22d29122b596435d9bc2ddf55bf4ddd2~mv2.jpg",
      "https://zestinatote.com/wp-content/uploads/2023/10/cliff-side-dining-1.jpg",
      "https://freedomdestinations.co.uk/wp-content/uploads/SanurBali.jpg",
      "https://tse1.mm.bing.net/th/id/OIP.6E1LrCPEQ292mKunQWzPaAHaE7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    ]
  },
  {
    nama: "Gunung Bromo",
    deskripsi: "Gunung Bromo menghadirkan pengalaman petualangan vulkanik paling ikonik di Jawa Timur. Wisatawan dapat menikmati perjalanan jeep melintasi lautan pasir, menyaksikan sunrise spektakuler dari area Penanjakan, lalu menjelajahi kawah aktif dengan latar pegunungan Tengger yang dramatis.",
    lokasi: "Probolinggo, Jawa Timur",
    harga: 500000,
    foto_url: "https://i.pinimg.com/originals/45/19/52/451952ef490e0a74ffdf074145ad1a0e.jpg",
    foto_urls: [
      "https://i.pinimg.com/originals/45/19/52/451952ef490e0a74ffdf074145ad1a0e.jpg",
      "https://24travel.id/wp-content/uploads/2023/08/gunung-bromo-terletak-di-1.jpeg",
      "https://come2indonesia.com/wp-content/uploads/2020/07/Java_23_come2indonesia_Indonesia-700x500.jpg",
      "https://cdn.kimkim.com/files/a/images/8e446c6f6105068b8a215cd33d20d5b168bca38d/original-11b02606eb8550c35f4eee6d458e45f9.jpg",
      "https://media.istockphoto.com/id/1475031882/photo/view-of-tourists-riding-horses-to-the-steps-of-mount-bromo.jpg?s=170667a&w=0&k=20&c=duDu8mjb6DtnXVMWmsPrOjSqoGiNTm7t2bUCFVnBczs=",
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/94/64/74.jpg"
    ]
  },
  {
    nama: "Tana Toraja",
    deskripsi: "Kawasan budaya dengan rumah adat Tongkonan, lanskap pegunungan, tradisi unik, dan warisan budaya Toraja yang kuat.",
    lokasi: "Toraja, Sulawesi Selatan",
    harga: 1100000,
    foto_url: "https://images.squarespace-cdn.com/content/v1/5d09463a7ff6500001c3c9ba/1603495205261-6NKZGVSR0GPMOTSUUQKD/Sulawesi-11.jpg",
    foto_urls: [
      "https://images.squarespace-cdn.com/content/v1/5d09463a7ff6500001c3c9ba/1603495205261-6NKZGVSR0GPMOTSUUQKD/Sulawesi-11.jpg",
      "https://cdn.idntimes.com/content-images/post/20171102/gambar-museum-ne-gandeng-toraja-d97fc7dda542221786cb360d74911b04.jpg",
      "https://tse1.mm.bing.net/th/id/OIP.UmwEdrCXTOsf2cgkbOJKigHaE8?r=0&w=1000&h=667&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://tse2.mm.bing.net/th/id/OIP.SEq2CPhS5SkantquVlSYxwHaE7?r=0&w=509&h=339&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://i.pinimg.com/originals/cf/2c/c0/cf2cc00bef38e3e3eaca168275fd8887.jpg"
    ]
  },
  {
    nama: "Labuan Bajo",
    deskripsi: "Gerbang menuju Taman Nasional Komodo, terkenal dengan pulau eksotis, sailing trip, snorkeling, dan pemandangan sunset.",
    lokasi: "Manggarai Barat, Nusa Tenggara Timur",
    harga: 2500000,
    foto_url: "https://www.tripsavvy.com/thmb/lQZv0JYyFLHeEdhLsuRArtMesms=/4029x2471/filters:fill(auto,1)/padar-island-sunset---the-icon-of-komodo-national-park---labuan-bajo-in-flores-island--east-nusa-tenggara---indonesia-666311758-5bbf871ac9e77c005173b395.jpg",
    foto_urls: [
      "https://www.tripsavvy.com/thmb/lQZv0JYyFLHeEdhLsuRArtMesms=/4029x2471/filters:fill(auto,1)/padar-island-sunset---the-icon-of-komodo-national-park---labuan-bajo-in-flores-island--east-nusa-tenggara---indonesia-666311758-5bbf871ac9e77c005173b395.jpg",
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhST9mmkaRpVZrK_iG0PlgZKG3f-KkQM9PgAejinGlcthlDjk4HaYPksXNblZ22zk_9Jxq44mwj-_eyqnf2uZ8um1A6C6cD6aDoURHS1IbbAX2YHrPvCuw3sVENEmtwvIw6hOzkPghyLRQP8fWXGucR7msEAjvJI_xDVs4nrSYqzgleQJO3DhaKVDZT/s1920/labuan-bajo-gc3e94d3af_1920.jpg",
      "https://wallpaperaccess.com/full/4632393.jpg",
      "https://asset.kompas.com/crops/eIP2s99xXyYl2dhwW9hDQ6QxisY=/0x0:780x520/750x500/data/photo/2019/09/26/5d8c64544d656.jpg",
      "https://assets.pikiran-rakyat.com/crop/0x0:0x0/1200x675/photo/2024/07/20/417452677.jpg"
    ]
  },
  {
    nama: "Kawah Ijen",
    deskripsi: "Kawah Ijen menawarkan pengalaman trekking malam yang unik dengan tujuan utama menyaksikan fenomena blue fire yang langka. Setelah perjalanan menuju puncak, wisatawan akan disambut danau kawah berwarna turquoise, lanskap vulkanik megah, dan aktivitas penambang belerang.",
    lokasi: "Banyuwangi, Jawa Timur",
    harga: 400000,
    foto_url: "https://tse2.mm.bing.net/th/id/OIP.2LYB8-GTtzBTivL3PDFsywHaE7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    foto_urls: [
      "https://tse2.mm.bing.net/th/id/OIP.2LYB8-GTtzBTivL3PDFsywHaE7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://images.rove.me/w_1920,q_85/kh4fsmnijphcrk9oi86y/java-kawah-ijen-volcano.jpg",
      "https://tse2.mm.bing.net/th/id/OIP.eR18DFHCFUKp6Q8f3N3v_QHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://tse2.mm.bing.net/th/id/OIP.ibUAr0aIrwHYYuBZI_hM3wHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://1.bp.blogspot.com/-o9fw0Tky3DY/Vx-nhoAX03I/AAAAAAAAP3c/TcfuEqHk-n0w3dy2NKRm0pokcqgHqBrXgCLcB/s1600/bluefire.jpg"
    ]
  },
  {
    nama: "Tangkuban Perahu",
    deskripsi: "Gunung berapi dengan kawah aktif yang mudah diakses, udara sejuk, dan legenda Sangkuriang yang melekat kuat.",
    lokasi: "Bandung Barat, Jawa Barat",
    harga: 350000,
    foto_url: "https://melampa.com/wp-content/uploads/2019/08/The-crater-of-Tangkuban-Perahu.jpg",
    foto_urls: [
      "https://melampa.com/wp-content/uploads/2019/08/The-crater-of-Tangkuban-Perahu.jpg",
      "https://awsimages.detik.net.id/community/media/visual/2021/02/04/dev-sunrise-di-kaki-tangkuban-perahu-tak-kalah-dengan-bromo.jpeg?w=600&q=90",
      "https://assets.telkomsel.com/public/2025-01/tangkuban-perahu.png?VersionId=DLsVx92MTPh2PLz21LG4mAbPuC_jB5iq",
      "https://thumbs.dreamstime.com/b/crater-mount-tangkuban-perahu-very-beautiful-262422498.jpg",
      "https://travelspromo.com/wp-content/uploads/2019/06/Kawah-Putih-Bandung-terbentuk-secara-alami-dari-hasil-letusan-Gunung-Patuha-dengan-endapan-tuff-putih-Bhisma-Puput-e1561615291307.jpg"
    ]
  },
  {
    nama: "Pulau Derawan",
    deskripsi: "Destinasi tropis untuk snorkeling, diving, penyu laut, dan laguna ubur-ubur yang menjadi daya tarik wisata bahari.",
    lokasi: "Berau, Kalimantan Timur",
    harga: 1650000,
    foto_url: "https://img.herstory.co.id/articles/archive_20210414/pulau-derawan-20210414-130341.jpg",
    foto_urls: [
      "https://img.herstory.co.id/articles/archive_20210414/pulau-derawan-20210414-130341.jpg",
      "https://www.indonesia.travel/contentassets/002964be0f414c64a4321cdd41f4ec02/derawan_banner.jpg",
      "https://1.bp.blogspot.com/-CpSo-5lUN-k/XmXHCP3a0WI/AAAAAAAAve4/DK-Vf4AeEjsFwDMPSlyUHKfrqUUcTRG2QCLcBGAsYHQ/s1600/Pantai%2BMaratua.jpg",
      "https://indonesiakaya.com/wp-content/uploads/2020/10/kepulauan_derawan_1200.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Derawan_Island_East_Kalimantan.jpg/960px-Derawan_Island_East_Kalimantan.jpg"
    ]
  },
  {
    nama: "Danau Toba",
    deskripsi: "Danau vulkanik terbesar di Asia Tenggara dengan Pulau Samosir, budaya Batak, dan panorama perbukitan yang menenangkan.",
    lokasi: "Samosir, Sumatera Utara",
    harga: 850000,
    foto_url: "https://tse2.mm.bing.net/th/id/OIP.o2seoNF8H76hTZ_bXHD-ygHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    foto_urls: [
      "https://tse2.mm.bing.net/th/id/OIP.o2seoNF8H76hTZ_bXHD-ygHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://regalsprings.co.id/wp-content/uploads/2023/05/danau-toba.jpg",
      "https://4.bp.blogspot.com/-fVZpGJHVLOE/WYr_oAy6_oI/AAAAAAAAAok/tmasQhMpT586Zf03gdvZGmicnCn-y1TtACLcBGAs/s1600/danau-toba-dari-balige-1.jpg",
      "https://www.ingatlah.com/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-27-at-14.02.58-e1735283082591.jpeg",
      "https://cdn.idntimes.com/content-images/post/20190730/62249431-462455564525378-5486123942464888749-n-55eb79f2a7d11a83fce8a36fd33e2e6d.jpg"
    ]
  },
  {
    nama: "Candi Borobudur",
    deskripsi: "Candi Borobudur adalah mahakarya warisan dunia UNESCO yang menawarkan pengalaman budaya, sejarah, dan spiritual dalam satu perjalanan premium. Wisatawan akan menikmati kemegahan arsitektur Buddha terbesar di dunia, detail relief, serta panorama perbukitan Menoreh.",
    lokasi: "Magelang, Jawa Tengah",
    harga: 300000,
    foto_url: "https://th.bing.com/th/id/R.aac182aa38609a60f4321b8319e211f9?rik=8h2ui7UMhqYlew&riu=http%3a%2f%2fidsejarah.net%2fwp-content%2fuploads%2f2016%2f08%2fcandi-borobudur-1024x576-1.jpg&ehk=d9xCUSEpsDzfrwNSb3q0CqcKETqGNksduGGMqUZyXJE%3d&risl=&pid=ImgRaw&r=0",
    foto_urls: [
      "https://th.bing.com/th/id/R.aac182aa38609a60f4321b8319e211f9?rik=8h2ui7UMhqYlew&riu=http%3a%2f%2fidsejarah.net%2fwp-content%2fuploads%2f2016%2f08%2fcandi-borobudur-1024x576-1.jpg&ehk=d9xCUSEpsDzfrwNSb3q0CqcKETqGNksduGGMqUZyXJE%3d&risl=&pid=ImgRaw&r=0",
      "https://images.bisnis.com/upload/img/Candi_Borobudur_-_Dok__Borobudur_Park__2_.jpg",
      "https://wallpapers.com/images/hd/famous-borobudur-temple-indonesia-il0viuf0a1eacz5p.jpg",
      "https://i.pinimg.com/originals/82/35/04/823504c09bc9d9477c97cb0de64e23f8.jpg",
      "https://traveling.co.id/wp-content/uploads/2022/03/4019530214-e1647790256551.jpg"
    ]
  },
  {
    nama: "Raja Ampat",
    deskripsi: "Raja Ampat adalah surga bahari Indonesia yang terkenal dengan gugusan pulau karst, gradasi laut biru turquoise, dan kekayaan biodiversitas bawah laut kelas dunia. Destinasi ini dirancang untuk wisatawan yang mencari pengalaman eksklusif: island hopping, snorkeling, dan diving.",
    lokasi: "Raja Ampat, Papua Barat Daya",
    harga: 4500000,
    foto_url: "https://wallpapercave.com/wp/wp4190806.jpg",
    foto_urls: [
      "https://wallpapercave.com/wp/wp4190806.jpg",
      "https://phinisitrip.com/wp-content/uploads/2025/11/coral-slope-snorkeling-raja-ampat-1024x681.webp",
      "https://www.tropicalsnorkeling.com/wp-content/uploads/2022/09/snorkelers-over-raja-ampat-reef.jpg",
      "https://th.bing.com/th/id/R.5c19235cc744def6840e09a7e3345244?rik=7Ncx5u0H5tJ8jA&riu=http%3a%2f%2fsnorkelingetc.com%2fwp-content%2fuploads%2f2016%2f12%2fPA310903.jpg&ehk=wG36Z%2bDJPOZ6TEU49fTrLyQp7AMZQcqTvEea2b2ZRwY%3d&risl=&pid=ImgRaw&r=0",
      "https://d20knvk822eu5a.cloudfront.net/s3fs-public-optimized/2024-01/Raja%20Ampat_Wayag%20-%2001_0.JPG.webp"
    ]
  },
  {
    nama: "Pantai Kuta Bali",
    deskripsi: "Pantai ikonik di Bali dengan hamparan pasir luas, matahari terbenam dramatis, dan akses mudah ke pusat kuliner serta belanja.",
    lokasi: "Badung, Bali",
    harga: 250000,
    foto_url: "https://images.ctfassets.net/pj3idduy0ni9/2BsaLfhco58uafWL3eDtDf/5aa74e43e3a26a0da9fa8cf78ca4f0a7/wisata-pantai-kuta-bali.jpg",
    foto_urls: [
      "https://images.ctfassets.net/pj3idduy0ni9/2BsaLfhco58uafWL3eDtDf/5aa74e43e3a26a0da9fa8cf78ca4f0a7/wisata-pantai-kuta-bali.jpg",
      "https://blog.tripcetera.com/id/wp-content/uploads/2020/03/leebudihart_76864081_2484833498431751_3194446755026370817_n-1024x768.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Pantai_Kuta_sejuta_cinta.jpg/960px-Pantai_Kuta_sejuta_cinta.jpg",
      "https://media.nomadicmatt.com/kutabalimain.jpg",
      "https://mliaimphxbwf.i.optimole.com/KlScy8M-MROiNij8/w:1024/h:768/q:75/https://whiterabbitpeaks.com/wp-content/uploads/2020/01/Main_Kuta.jpg"
    ]
  }
];

Tolong masukkan data array ini ke dalam file seeder tersebut, pastikan fungsi eksekusinya menggunakan skema `.upsert()` Supabase agar aman dari crash, lalu kabari saya jika proses penulisan kodenya telah berhasil kamu lakukan!