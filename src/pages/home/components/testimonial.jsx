import React from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
    {
        name: 'Amina Ali',
        feedback: 'Alaab aad u tayo sareysa oo gaarsiin degdeg ah! Aad baan ugu qanacsanahay.',
        image: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
        name: 'Mohamed Hassan',
        feedback: 'Adeeg aad u wanaagsan, qiimo jaban, iyo nidaam lacag bixin oo aamin ah.',
        image: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
        name: 'Khadra Yusuf',
        feedback: 'Waxaan jecelahay sida fudud ee alaabta looga dalban karo oo loo heli karo waqtigeeda.',
        image: 'https://randomuser.me/api/portraits/women/75.jpg'
    },
    {
        name: 'Ahmed Omar',
        feedback: 'Qiimaha iyo tayada alaabtu waa mid aad u wanaagsan. Waxaan dib ugu soo noqon doonaa!',
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        name: 'Fadumo Ahmed',
        feedback: 'Adeeg degdeg ah oo macmiil fiican. Aad ayaan ugu faraxsanahay iibsashadayda!',
        image: 'https://randomuser.me/api/portraits/women/63.jpg'
    },
    {
        name: 'Yusuf Abdi',
        feedback: 'Waxaan helay wax aan rabay oo ay ku jiraan qiimo jaban. Waad mahadsan tahin!',
        image: 'https://randomuser.me/api/portraits/men/71.jpg'
    },
    {
        name: 'Hodan Mohamed',
        feedback: 'Ma jirto wax ka wanaagsan dalabka gudaha internetka. Aad ayaan ugu qanacsanahay!',
        image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        name: 'Abdiwali Ali',
        feedback: 'Wax kasta oo aan dalbaday ayaa ii gaadhay waqtigeeda. Adeeg wanaagsan!',
        image: 'https://randomuser.me/api/portraits/men/82.jpg'
    },
    {
        name: 'Nasra Ibrahim',
        feedback: 'Waxaan ku kalsoonahay dalabka alaabta. Waa shirkad aad u kalsooni badan!',
        image: 'https://randomuser.me/api/portraits/women/90.jpg'
    },
];

function Testimonials() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-heading mb-10 text-dark-default"
                >
                    Macaamiisha Maxay Ka Yiraahdeen?
                </motion.h2>

                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{
                        clickable: true,
                        el: '.custom-pagination',
                        bulletClass: 'custom-bullet',
                        bulletActiveClass: 'custom-bullet-active'
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 1
                        },
                        768: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        }
                    }}
                    className="pb-12"
                >
                    {testimonials.map((testimonial, idx) => (
                        <SwiperSlide key={idx}>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-gray-100 rounded-lg p-6 shadow-md flex flex-col items-center h-full"
                            >
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-16 h-16 rounded-full mb-4 object-cover"
                                />
                                <FaQuoteLeft className="text-primary-dark text-2xl mb-2" />
                                <p className="text-gray-700 italic mb-4">"{testimonial.feedback}"</p>
                                <h3 className="font-semibold text-dark-default">{testimonial.name}</h3>
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="custom-pagination flex justify-center gap-2 mt-6" />

                <style>{`
          .custom-bullet {
            width: 12px;
            height: 12px;
            background-color: #D1D5DB;
            border-radius: 50%;
            display: inline-block;
            margin: 0 4px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .custom-bullet-active {
            background-color: #38B2AC; 
            width: 30px;
            border-radius: 8px;
          }
        `}</style>
            </div>
        </section>
    );
}

export default Testimonials;