import BaseCom from "./BaseCom";
import L from "./Lang";

class Contact extends BaseCom {
    render() {
        return <div className="contact">
            <section className="about">
                <div className="container py-5">
                    <h1 className="text-center"><L>Contact Us</L></h1>
                    <h2 className="text-center fs-4"><L>Feel free to send us an e-mail or give us a call with any questions.</L></h2>
                    <div className="separator"></div>
                </div>
            </section>
            <section className="about bg-light">
                <div className="container py-5">
                    <div className="row mt-3 text-center">
                        <div className="col-6 col-md-4 mt-2">
                            <h3><L>Email</L></h3>
                            <p><a href="mailto:info@waitr.net">info@waitr.net</a></p>
                        </div>
                        <div className="col-6 col-md-4 mt-2">
                            <h3><L>Phone</L></h3>
                            <p><a href="tel:6174476581">(617) 447-6581</a></p>
                        </div>
                        <div className="col-12 col-md-4 mt-2">
                            <h3><L>Address</L></h3>
                            <p>RR 3 BOX 3824</p>
                            <p>SAN JUAN PR, 00926-8311</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>;
    }
}

export default Contact;