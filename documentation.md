# Code Documentation
Generated on: 2024-12-16T20:39:48.302Z
Total files: 12

## Project Structure

```
└── mas
    └── src
        └── services
            └── serviceDocumentation
                └── ServiceTree.ts
```

## File: pre-applypatch.sample
- Path: `/root/git/mas/.git/hooks/pre-applypatch.sample`
- Size: 424.00 B
- Extension: .sample
- Lines of code: 13

```sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed
# by applypatch from an e-mail message.
#
# The hook should exit with non-zero status after issuing an
# appropriate message if it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-applypatch".

. git-sh-setup
precommit="$(git rev-parse --git-path hooks/pre-commit)"
test -x "$precommit" && exec "$precommit" ${1+"$@"}
:

```

---------------------------------------------------------------------------

## File: pre-commit.sample
- Path: `/root/git/mas/.git/hooks/pre-commit.sample`
- Size: 1.60 KB
- Extension: .sample
- Lines of code: 40

```sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

if git rev-parse --verify HEAD >/dev/null 2>&1
then
	against=HEAD
else
	# Initial commit: diff against an empty tree object
	against=$(git hash-object -t tree /dev/null)
fi

# If you want to allow non-ASCII filenames set this variable to true.
allownonascii=$(git config --type=bool hooks.allownonascii)

# Redirect output to stderr.
exec 1>&2

# Cross platform projects tend to avoid non-ASCII filenames; prevent
# them from being added to the repository. We exploit the fact that the
# printable range starts at the space character and ends with tilde.
if [ "$allownonascii" != "true" ] &&
	# Note that the use of brackets around a tr range is ok here, (it's
	# even required, for portability to Solaris 10's /usr/bin/tr), since
	# the square bracket bytes happen to fall in the designated range.
	test $(git diff --cached --name-only --diff-filter=A -z $against |
	  LC_ALL=C tr -d '[ -~]\0' | wc -c) != 0
then
	cat <<\EOF
Error: Attempt to add a non-ASCII file name.

This can cause problems if you want to work with people on other platforms.

To be portable it is advisable to rename the file.

If you know what you are doing you can disable this check using:

  git config hooks.allownonascii true
EOF
	exit 1
fi

# If there are whitespace errors, print the offending file names and fail.
exec git diff-index --check --cached $against --

```

---------------------------------------------------------------------------

## File: pre-merge-commit.sample
- Path: `/root/git/mas/.git/hooks/pre-merge-commit.sample`
- Size: 416.00 B
- Extension: .sample
- Lines of code: 12

```sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git merge" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message to
# stderr if it wants to stop the merge commit.
#
# To enable this hook, rename this file to "pre-merge-commit".

. git-sh-setup
test -x "$GIT_DIR/hooks/pre-commit" &&
        exec "$GIT_DIR/hooks/pre-commit"
:

```

---------------------------------------------------------------------------

## File: pre-push.sample
- Path: `/root/git/mas/.git/hooks/pre-push.sample`
- Size: 1.34 KB
- Extension: .sample
- Lines of code: 47

```sample
#!/bin/sh

# An example hook script to verify what is about to be pushed.  Called by "git
# push" after it has checked the remote status, but before anything has been
# pushed.  If this script exits with a non-zero status nothing will be pushed.
#
# This hook is called with the following parameters:
#
# $1 -- Name of the remote to which the push is being done
# $2 -- URL to which the push is being done
#
# If pushing without using a named remote those arguments will be equal.
#
# Information about the commits which are being pushed is supplied as lines to
# the standard input in the form:
#
#   <local ref> <local oid> <remote ref> <remote oid>
#
# This sample shows how to prevent push of commits where the log message starts
# with "WIP" (work in progress).

remote="$1"
url="$2"

zero=$(git hash-object --stdin </dev/null | tr '[0-9a-f]' '0')

while read local_ref local_oid remote_ref remote_oid
do
	if test "$local_oid" = "$zero"
	then
		# Handle delete
		:
	else
		if test "$remote_oid" = "$zero"
		then
			# New branch, examine all commits
			range="$local_oid"
		else
			# Update to existing branch, examine new commits
			range="$remote_oid..$local_oid"
		fi

		# Check for WIP commit
		commit=$(git rev-list -n 1 --grep '^WIP' "$range")
		if test -n "$commit"
		then
			echo >&2 "Found WIP commit in $local_ref, not pushing"
			exit 1
		fi
	fi
done

exit 0

```

---------------------------------------------------------------------------

## File: pre-rebase.sample
- Path: `/root/git/mas/.git/hooks/pre-rebase.sample`
- Size: 4.78 KB
- Extension: .sample
- Lines of code: 138

```sample
#!/bin/sh
#
# Copyright (c) 2006, 2008 Junio C Hamano
#
# The "pre-rebase" hook is run just before "git rebase" starts doing
# its job, and can prevent the command from running by exiting with
# non-zero status.
#
# The hook is called with the following parameters:
#
# $1 -- the upstream the series was forked from.
# $2 -- the branch being rebased (or empty when rebasing the current branch).
#
# This sample shows how to prevent topic branches that are already
# merged to 'next' branch from getting rebased, because allowing it
# would result in rebasing already published history.

publish=next
basebranch="$1"
if test "$#" = 2
then
	topic="refs/heads/$2"
else
	topic=`git symbolic-ref HEAD` ||
	exit 0 ;# we do not interrupt rebasing detached HEAD
fi

case "$topic" in
refs/heads/??/*)
	;;
*)
	exit 0 ;# we do not interrupt others.
	;;
esac

# Now we are dealing with a topic branch being rebased
# on top of master.  Is it OK to rebase it?

# Does the topic really exist?
git show-ref -q "$topic" || {
	echo >&2 "No such branch $topic"
	exit 1
}

# Is topic fully merged to master?
not_in_master=`git rev-list --pretty=oneline ^master "$topic"`
if test -z "$not_in_master"
then
	echo >&2 "$topic is fully merged to master; better remove it."
	exit 1 ;# we could allow it, but there is no point.
fi

# Is topic ever merged to next?  If so you should not be rebasing it.
only_next_1=`git rev-list ^master "^$topic" ${publish} | sort`
only_next_2=`git rev-list ^master           ${publish} | sort`
if test "$only_next_1" = "$only_next_2"
then
	not_in_topic=`git rev-list "^$topic" master`
	if test -z "$not_in_topic"
	then
		echo >&2 "$topic is already up to date with master"
		exit 1 ;# we could allow it, but there is no point.
	else
		exit 0
	fi
else
	not_in_next=`git rev-list --pretty=oneline ^${publish} "$topic"`
	/usr/bin/perl -e '
		my $topic = $ARGV[0];
		my $msg = "* $topic has commits already merged to public branch:\n";
		my (%not_in_next) = map {
			/^([0-9a-f]+) /;
			($1 => 1);
		} split(/\n/, $ARGV[1]);
		for my $elem (map {
				/^([0-9a-f]+) (.*)$/;
				[$1 => $2];
			} split(/\n/, $ARGV[2])) {
			if (!exists $not_in_next{$elem->[0]}) {
				if ($msg) {
					print STDERR $msg;
					undef $msg;
				}
				print STDERR " $elem->[1]\n";
			}
		}
	' "$topic" "$not_in_next" "$not_in_master"
	exit 1
fi

<<\DOC_END

This sample hook safeguards topic branches that have been
published from being rewound.

The workflow assumed here is:

 * Once a topic branch forks from "master", "master" is never
   merged into it again (either directly or indirectly).

 * Once a topic branch is fully cooked and merged into "master",
   it is deleted.  If you need to build on top of it to correct
   earlier mistakes, a new topic branch is created by forking at
   the tip of the "master".  This is not strictly necessary, but
   it makes it easier to keep your history simple.

 * Whenever you need to test or publish your changes to topic
   branches, merge them into "next" branch.

The script, being an example, hardcodes the publish branch name
to be "next", but it is trivial to make it configurable via
$GIT_DIR/config mechanism.

With this workflow, you would want to know:

(1) ... if a topic branch has ever been merged to "next".  Young
    topic branches can have stupid mistakes you would rather
    clean up before publishing, and things that have not been
    merged into other branches can be easily rebased without
    affecting other people.  But once it is published, you would
    not want to rewind it.

(2) ... if a topic branch has been fully merged to "master".
    Then you can delete it.  More importantly, you should not
    build on top of it -- other people may already want to
    change things related to the topic as patches against your
    "master", so if you need further changes, it is better to
    fork the topic (perhaps with the same name) afresh from the
    tip of "master".

Let's look at this example:

		   o---o---o---o---o---o---o---o---o---o "next"
		  /       /           /           /
		 /   a---a---b A     /           /
		/   /               /           /
	       /   /   c---c---c---c B         /
	      /   /   /             \         /
	     /   /   /   b---b C     \       /
	    /   /   /   /             \     /
    ---o---o---o---o---o---o---o---o---o---o---o "master"


A, B and C are topic branches.

 * A has one fix since it was merged up to "next".

 * B has finished.  It has been fully merged up to "master" and "next",
   and is ready to be deleted.

 * C has not merged to "next" at all.

We would want to allow C to be rebased, refuse A, and encourage
B to be deleted.

To compute (1):

	git rev-list ^master ^topic next
	git rev-list ^master        next

	if these match, topic has not merged in next at all.

To compute (2):

	git rev-list master..topic

	if this is empty, it is fully merged to "master".

DOC_END

```

---------------------------------------------------------------------------

## File: pre-receive.sample
- Path: `/root/git/mas/.git/hooks/pre-receive.sample`
- Size: 544.00 B
- Extension: .sample
- Lines of code: 23

```sample
#!/bin/sh
#
# An example hook script to make use of push options.
# The example simply echoes all push options that start with 'echoback='
# and rejects all pushes when the "reject" push option is used.
#
# To enable this hook, rename this file to "pre-receive".

if test -n "$GIT_PUSH_OPTION_COUNT"
then
	i=0
	while test "$i" -lt "$GIT_PUSH_OPTION_COUNT"
	do
		eval "value=\$GIT_PUSH_OPTION_$i"
		case "$value" in
		echoback=*)
			echo "echo from the pre-receive-hook: ${value#*=}" >&2
			;;
		reject)
			exit 1
		esac
		i=$((i + 1))
	done
fi

```

---------------------------------------------------------------------------

## File: prepare-commit-msg.sample
- Path: `/root/git/mas/.git/hooks/prepare-commit-msg.sample`
- Size: 1.46 KB
- Extension: .sample
- Lines of code: 37

```sample
#!/bin/sh
#
# An example hook script to prepare the commit log message.
# Called by "git commit" with the name of the file that has the
# commit message, followed by the description of the commit
# message's source.  The hook's purpose is to edit the commit
# message file.  If the hook fails with a non-zero status,
# the commit is aborted.
#
# To enable this hook, rename this file to "prepare-commit-msg".

# This hook includes three examples. The first one removes the
# "# Please enter the commit message..." help message.
#
# The second includes the output of "git diff --name-status -r"
# into the message, just before the "git status" output.  It is
# commented because it doesn't cope with --amend or with squashed
# commits.
#
# The third example adds a Signed-off-by line to the message, that can
# still be edited.  This is rarely a good idea.

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

/usr/bin/perl -i.bak -ne 'print unless(m/^. Please enter the commit message/..m/^#$/)' "$COMMIT_MSG_FILE"

# case "$COMMIT_SOURCE,$SHA1" in
#  ,|template,)
#    /usr/bin/perl -i.bak -pe '
#       print "\n" . `git diff --cached --name-status -r`
# 	 if /^#/ && $first++ == 0' "$COMMIT_MSG_FILE" ;;
#  *) ;;
# esac

# SOB=$(git var GIT_COMMITTER_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# git interpret-trailers --in-place --trailer "$SOB" "$COMMIT_MSG_FILE"
# if test -z "$COMMIT_SOURCE"
# then
#   /usr/bin/perl -i.bak -pe 'print "\n" if !$first_line++' "$COMMIT_MSG_FILE"
# fi

```

---------------------------------------------------------------------------

## File: master
- Path: `/root/git/mas/.git/refs/heads/master`
- Size: 41.00 B
- Extension: 
- Lines of code: 1

```plaintext
d6086da619d63a0ed59b1b466b10a6a2a34f4e5b

```

---------------------------------------------------------------------------

## File: ServiceTree.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/ServiceTree.ts`
- Size: 2.11 KB
- Extension: .ts
- Lines of code: 69

```ts
import * as path from "path";
import { ITreeNode } from "./types";
import { FileSystemService } from "../serviceFileSystem";

export class TreeService {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async createTreeNode(
    nodePath: string,
    relativePath: string
  ): Promise<ITreeNode | null> {
    const stats = await this.fileSystemService.getFileStats(nodePath);
    const name = path.basename(nodePath);

    if (!this.fileSystemService.shouldInclude(nodePath)) return null;

    if (stats.isDirectory()) {
      const entries = await this.fileSystemService.readDirectory(nodePath);
      const children: ITreeNode[] = [];

      for (const entry of entries) {
        const childNode = await this.createTreeNode(
          entry,
          path.join(relativePath, name)
        );
        if (childNode) children.push(childNode);
      }

      // Only include directory if it has children or contains matching files
      if (children.length > 0) {
        return {
          name,
          path: relativePath || name,
          type: "directory",
          children
        };
      }

      return null;
    }

    // For files, check if they match the pattern
    const stats2 = await this.fileSystemService.getFileStats(nodePath);
    if (this.fileSystemService.shouldIncludeFile(nodePath, stats2.size)) {
      return {
        name,
        path: relativePath || name,
        type: "file",
        children: []
      };
    }

    return null;
  }

  public renderTree(node: ITreeNode): string {
    const renderNode = (
      node: ITreeNode,
      prefix = "",
      isLast = true
    ): string[] => {
      const lines = [`${prefix}${isLast ? "└── " : "├── "}${node.name}`];
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      if (node.type === "directory") {
        node.children.forEach((child, index) => {
          lines.push(
            ...renderNode(
              child,
              childPrefix,
              index === node.children.length - 1
            )
          );
        });
      }

      return lines;
    };

    return renderNode(node).join("\n");
  }
}

```

---------------------------------------------------------------------------

## File: master
- Path: `/root/git/mas/.git/logs/refs/heads/master`
- Size: 898.00 B
- Extension: 
- Lines of code: 5

```plaintext
0000000000000000000000000000000000000000 9b396108ab1b5094afcd2f547385f99195fd3919 aminesayagh <aminesayagh1997@gmail.com> 1734164517 +0000	commit (initial): init repertory
9b396108ab1b5094afcd2f547385f99195fd3919 cf7a3c90f5bbd02d6692329d3f02f56b38388004 aminesayagh <aminesayagh1997@gmail.com> 1734166434 +0000	commit: create find command for testing
cf7a3c90f5bbd02d6692329d3f02f56b38388004 632c379e23a6a931789c246119a9b0f0b746029b aminesayagh <aminesayagh1997@gmail.com> 1734170246 +0000	commit: add list command, and implement menu experience
632c379e23a6a931789c246119a9b0f0b746029b f23c36f9213284e59990cdefb28b60564a19695f aminesayagh <aminesayagh1997@gmail.com> 1734173780 +0000	commit: doc repo
f23c36f9213284e59990cdefb28b60564a19695f d6086da619d63a0ed59b1b466b10a6a2a34f4e5b aminesayagh <aminesayagh1997@gmail.com> 1734378095 +0000	commit: add code documentation functionality to the code

```

---------------------------------------------------------------------------

## File: master
- Path: `/root/git/mas/.git/refs/remotes/origin/master`
- Size: 41.00 B
- Extension: 
- Lines of code: 1

```plaintext
d6086da619d63a0ed59b1b466b10a6a2a34f4e5b

```

---------------------------------------------------------------------------

## File: master
- Path: `/root/git/mas/.git/logs/refs/remotes/origin/master`
- Size: 770.00 B
- Extension: 
- Lines of code: 5

```plaintext
0000000000000000000000000000000000000000 9b396108ab1b5094afcd2f547385f99195fd3919 aminesayagh <aminesayagh1997@gmail.com> 1734164524 +0000	update by push
9b396108ab1b5094afcd2f547385f99195fd3919 cf7a3c90f5bbd02d6692329d3f02f56b38388004 aminesayagh <aminesayagh1997@gmail.com> 1734166439 +0000	update by push
cf7a3c90f5bbd02d6692329d3f02f56b38388004 632c379e23a6a931789c246119a9b0f0b746029b aminesayagh <aminesayagh1997@gmail.com> 1734170250 +0000	update by push
632c379e23a6a931789c246119a9b0f0b746029b f23c36f9213284e59990cdefb28b60564a19695f aminesayagh <aminesayagh1997@gmail.com> 1734173782 +0000	update by push
f23c36f9213284e59990cdefb28b60564a19695f d6086da619d63a0ed59b1b466b10a6a2a34f4e5b aminesayagh <aminesayagh1997@gmail.com> 1734378097 +0000	update by push

```

---------------------------------------------------------------------------