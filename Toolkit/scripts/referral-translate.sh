#!/bin/sh
dotnet ../bin/Release/net10.0/Toolkit.dll translate-reactjs '../../MarketplaceReferral/ClientApp/src/components' '../../MarketplaceReferral/ClientApp/public/lang/dict.json'
cp ../../MarketplaceReferral/ClientApp/public/lang/dict.json referral-dict.json.bak
cp dict.json ../../MarketplaceReferral/ClientApp/public/lang/dict.json
rm dict.csv
rm dict.json