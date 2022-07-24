core=(
    "@flysystem-ts/common"
    "@flysystem-ts/adapter-interface"
)
coreDev=(
    "@flysystem-ts/flysystem"
)
coreSorted=(
    ${core[@]}
    ${coreDev[@]}
)
adapters=(
    "@flysystem-ts/drop-box-adapter"
    "@flysystem-ts/google-drive-adapter"
    "@flysystem-ts/one-drive-adapter"
)

for c in ${coreSorted[@] adapters[@]}; do
    npx lerna exec "npm uninstall $c"
done

for c in ${!coreSorted[@]}; do
    npx lerna exec "npm i --scope=${coreSorted[$c]}"

    for cc in ${!coreSorted[@]}; do
        if [ $cc -lt $c ]; then
            npx lerna add ${coreSorted[$cc]} --scope=${coreSorted[$c]}
        fi
    done

    npx lerna run build --scope=${coreSorted[$c]}
done

for a in ${!adapters[@]}; do
    npx lerna exec "npm i --scope=${adapters[$a]}"

    for c in ${!core[@]}; do
        npx lerna add ${core[$c]} --scope=${adapters[$a]}
    done

    for cD in ${!coreDev[@]}; do
        npx lerna add -D ${coreDev[$cD]} --scope=${adapters[$a]}
    done

    npx lerna run build --scope=${adapters[$a]}
done

npx lerna bootstrap
