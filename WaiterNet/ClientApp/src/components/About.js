import BaseCom from "./BaseCom";
import L from "./Lang";

class About extends BaseCom {
    render() {
        return <div className="About">
            <section className="about">
                <div className="container py-5">
                    <h1 className="text-center"><L>About Us</L></h1>
                    <div className="separator"></div>
                </div>
            </section>
            <section className="about bg-light">
                <div className="container py-5">
                    <h2 className="text-center"><L>We're dedicated to providing food enthusiasts with an exceptional automation experience, all while ensuring on agumenting the restaurant ordering process.</L></h2>
                    <div className="row mt-3">
                        <div className="col-md-6 mt-2">
                            <p><L>While many restaurants have great food, they lose potential sales because they don't provide an online ordering service for dine-in. Slow orders can result in angry customers, not wanting to ever return.</L></p>
                        </div>
                        <div className="col-md-6 mt-2">
                            <p><L>With our qr-code ordering systems, clients do not have to wait to be attended to perform their order. This results in the restaurant having a higher turn-around times, more tables attended, and happy customers.</L></p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="about">
                <div className="container py-5">
                    <h2 className="text-center"><L>Our Values</L></h2>
                    <div className="row mt-3 text-center">
                        <div className="col-md-4 mt-2">
                            <h3><L>Dedication to Clients</L></h3>
                            <p><L>We prioritize our customers' requirements above everything else, consistently aiming to surpass their anticipations.</L></p>
                        </div>
                        <div className="col-md-4 mt-2">
                            <h3><L>Passionate</L></h3>
                            <p><L>We are devoted to developing a cutting-edge SaaS product and achieving unprecedented levels of success.</L></p>
                        </div>
                        <div className="col-md-4 mt-2">
                            <h3><L>Innovation</L></h3>
                            <p><L>We believe that excellence surpasses greatness, which is why we are committed to delivering continuous enhancements.</L></p>
                        </div>
                    </div>
                </div>
            </section>
        </div>;
    }
}

export default About;