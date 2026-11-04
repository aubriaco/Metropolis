import BaseCom from "./BaseCom";
import InitSignUp from "./InitSignUp";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class Pricing extends BaseCom {
    render() {
        return <div className="Pricing">
            <section className="about">
                <div className="container py-5">
                    <h1 className="text-center"><L>Flat-fee monthly SaaS Payment</L></h1>
                    <h2 className="text-center fs-4"><L>No surpirses! Only $100/month</L></h2>
                    <div className="separator"></div>
                </div>
            </section>
            <section className="about bg-light">
                <div className="container py-5">
                    <h2 className="text-center"><L>Included in your $100/month monthly plan!</L></h2>
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="row row-cols-2 jusity-content-center align-items-stretch text-center text-md-left">
                                <div className="col mt-3">
                                    <div className="feature d-block d-md-flex">
                                        <div className="icon">
                                            <img src="/img/icons/orders.png" alt="" className="d-block" />
                                        </div>
                                        <div className="flex-fill">
                                            <h4><L>Unlimited Orders</L></h4>
                                            <p><L>Enjoy the freedom of accepting unlimited orders with Waitr.NET, ensuring your restaurant can cater to every hungry customer's needs.</L></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col mt-3">
                                    <div className="feature d-block d-md-flex">
                                        <div className="icon">
                                            <img src="/img/icons/tables.png" alt="" className="d-block" />
                                        </div>
                                        <div className="flex-fill">
                                            <h4><L>Unlimited Tables</L></h4>
                                            <p><L>Unlock the potential of serving an unlimited number of tables with the platform, allowing your restaurant to accommodate any crowd effortlessly.</L></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col mt-3">
                                    <div className="feature d-block d-md-flex">
                                        <div className="icon">
                                            <img src="/img/icons/ordering.png" alt="" className="d-block" />
                                        </div>
                                        <div className="flex-fill">
                                            <h4><L>Real-time Ordering</L></h4>
                                            <p><L>Orders will appear real-time in your POS or tablet running Waitr.NET order dashboard.</L></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col mt-3">
                                    <div className="feature d-block d-md-flex">
                                        <div className="icon">
                                            <img src="/img/icons/integration.png" alt="" className="d-block" />
                                        </div>
                                        <div className="flex-fill">
                                            <h4><L>Payment Gateway</L></h4>
                                            <p><L>Have your clients pay online directly after ordering from the menu.</L></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <InitSignUp />
        </div>;
    }
}

export default withParamsAndNavigate(Pricing);