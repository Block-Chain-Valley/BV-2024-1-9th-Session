#!/usr/bin/env sh

local_branch_name="$(git rev-parse --abbrev-ref HEAD)"
error_message="[Error] 브랜치 이름이 잘못되었습니다 : $local_branch_name"

if [[ $local_branch_name =~ ^(master)$ ]]; then
    echo "\033[32m✔\033[m Branch(Master): $local_branch_name"
    exit 0
elif [[ $local_branch_name =~ ^(release\/([0-9.]+))$ ]]; then
    echo "\033[32m✔\033[m Branch(Release): $local_branch_name"
    exit 0
elif [[ $local_branch_name =~ ^(feature\/([a-zA-Z0-9.]+-[0-9]+)-(.+))$ ]]; then
    echo "\033[32m✔\033[m Branch(Feature): $local_branch_name"
    exit 0
elif [[ $local_branch_name =~ ^(hotfix\/([a-zA-Z0-9.]+-[0-9]+)-(.+))$ ]]; then
    echo "\033[32m✔\033[m Branch(Hotfix): $local_branch_name"
    exit 0
elif [[ $local_branch_name =~ ^(wip\/(.+))$ ]]; then
    echo "\033[32m✔\033[m Branch(Wip): $local_branch_name"
    exit 0
elif [[ $local_branch_name =~ ^(dev\/(.+))$ ]]; then
    echo "\033[32m✔\033[m Branch(Dev): $local_branch_name"
    exit 0
fi

echo "\033[31m✘\033[m $error_message"
exit 1