import SchemesList from "../components/schemes/SchemesList";
import EligibilityChecker from "../components/schemes/EligibilityChecker";
import AdvisoryFeed from "../components/schemes/AdvisoryFeed";
import AiCropDoctor from "../components/schemes/AiCropDoctor";

const SchemesPage = () => {
    return (
        <div className="min-h-full pb-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Government Schemes & Advisory</h1>
                <p className="text-gray-500">Find schemes you are eligible for and get expert advice.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Schemes List (Takes up 2/3 of space on large screens) */}
                <div className="lg:col-span-2">
                    <SchemesList />
                </div>

                {/* Right Column: Eligibility & Advisory (Takes up 1/3 of space) */}
                <div className="space-y-6">
                    <EligibilityChecker />
                    <AiCropDoctor />
                    <AdvisoryFeed />
                </div>
            </div>
        </div>
    );
};

export default SchemesPage;
