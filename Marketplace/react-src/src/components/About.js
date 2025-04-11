/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class About extends BaseCom {
    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="About Us" />
                <section className="py-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-2 fs-5">
                                <L>Who We Are</L>
                            </div>
                            <div className="col-md-10">
                                <p><L>Metropolis Market is an online marketplace that connects local vendors and customers in Puerto Rico. We offer a wide range of products from appliances to automotive parts and accessories, all delivered fast and securely to your doorstep.</L></p>
                                <p><L>Our mission is to provide a convenient and reliable platform for local businesses and consumers to buy and sell products online. We aim to support the local economy and community by creating opportunities for small and medium enterprises to reach more customers and grow their businesses.</L></p>
                                <p><L>Our vision is to become the leading online marketplace in Puerto Rico, offering the best products, prices, and customer service. We want to create a trusted and loyal community of vendors and customers who share our values of quality, innovation, and sustainability.</L></p>
                                <p><L>We are a team of passionate and experienced professionals who are dedicated to making Metropolis Market the best online shopping experience for you. We are constantly working to improve our website, products, and services to meet your needs and expectations. We are also committed to giving back to our community by supporting local causes and initiatives.</L></p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(About);