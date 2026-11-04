#!/bin/sh
cp ../../WaiterNet/ClientApp/public/lang/dict.json waiternet-dict.json.bak
dotnet ../bin/Release/net10.0/Toolkit.dll translate-reactjs '../../WaiterNet/ClientApp/src/components' '../../WaiterNet/ClientApp/public/lang/dict.json'
cp dict.json ../../WaiterNet/ClientApp/public/lang/dict.json
rm dict.csv
rm dict.json
dotnet ../bin/Release/net10.0/Toolkit.dll translate-csharp '../../WaiterNet/Controllers' '../../WaiterNet/ClientApp/public/lang/dict.json'
cp dict.json ../../WaiterNet/ClientApp/public/lang/dict.json
rm dict.csv
rm dict.json
dotnet ../bin/Release/net10.0/Toolkit.dll translate-csharp '../../Marketplace/Controllers' '../../WaiterNet/ClientApp/public/lang/dict.json'
cp dict.json ../../WaiterNet/ClientApp/public/lang/dict.json
rm dict.csv
rm dict.json
rm waiternet-dict.json.bak