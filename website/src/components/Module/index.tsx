import React, { DOMElement, useState } from "react";
import { since, size } from "../../utils/format";
import {
  AlertOctagon,
  ArrowUpDown,
  BookOpen,
  Box,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  GitCommit,
  GitFork,
  Github,
  History,
  Lock,
  Milestone,
  Scale,
  Star,
  User,
} from "lucide-react";
import { useHistory, useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import Head from "@docusaurus/Head";

const Module = (props) => {
  let history = useHistory();
  let location = useLocation();
  let version = getVersion(location);
  let release = getReleaseForTag(props.data.releases, version);

  let [workspaceCopied, setWorkspaceCopied] = useState(false);
  let [moduleCopied, setModuleCopied] = useState(false);

  let module = props.data.modules[0];
  let versionData =
    release &&
    module &&
    module.version_data &&
    module.version_data[release.tag_name.replace(/^v/, "")];
  let yanked =
    release &&
    module &&
    module.yanked_versions &&
    module.yanked_versions[release.tag_name.replace(/^v/, "")];
  let image = `https://registry.build/github/${
    props.data.repo.full_name + (version ? `@${version}` : "")
  }/image.png`;
  let title = `Bazel ${
    props.data.name + (version ? version : "")
  } - The Build Registry`;
  // console.log(props.data);
  return (
    <div className="package-page">
      <Head>
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />
        <meta name="og:description" content={props.data.repo.description} />
        <meta
          name="twitter:description"
          content={props.data.repo.description}
        />
        <meta name="og:image" content={image} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@BuildRegistry" />
      </Head>
      <div className="package">
        <div className="package-header">
          <div className="package-name">{props.data.name}</div>
          <img
            className="package-image"
            src={props.data.repo.owner.avatar_url}
            loading="lazy"
          />
        </div>{" "}
        <div className="package-stats">
          <div className="package-version">
            <GitCommit className="package-icon" />
            {(release && release.tag_name) || "unknown"}
          </div>
          <div className="package-age">
            <History className="package-icon" />
            published {(release && since(release.published_at)) ||
              "unknown"}{" "}
            ago
          </div>
          <div className="package-stars">
            <Star className="package-icon" />
            {props.data.repo.stargazers_count.toLocaleString()} stars
          </div>
          <div className="package-forks">
            <GitFork className="package-icon" />
            {props.data.repo.forks_count.toLocaleString()} forks
          </div>
          <div className="package-subscribers">
            <Eye className="package-icon" />
            {props.data.repo.subscribers_count.toLocaleString()} watchers
          </div>
        </div>
        <div className="package-stats">
          <div className="package-repo">
            <Github className="package-icon" />
            <a target="_blank" href={props.data.repo.html_url}>
              {props.data.repo.full_name}
            </a>
          </div>
          <div className="package-license">
            <Scale className="package-icon" />
            {props.data.repo.license.name}
          </div>
          <div className="package-visibility">
            <BookOpen className="package-icon" />
            {props.data.repo.visibility}
          </div>
          {release && (
            <div className="package-assets">
              <Box className="package-icon" />
              {release.assets.length.toLocaleString()} assets
            </div>
          )}
          {release && release.assets.length > 0 && (
            <div className="package-assets">
              <Download className="package-icon" />
              {props.data.releases
                .flatMap((r) => r.assets)
                .map((a) => a.download_count)
                .reduce((a, b) => a + b)
                .toLocaleString()}{" "}
              downloads
            </div>
          )}
          {release && release.assets.length > 0 && (
            <div className="package-assets">
              <ArrowUpDown className="package-icon" />
              {size(
                release.assets
                  .map((a) => a.size)
                  .reduce((a, b) => Math.max(a, b))
              )}
            </div>
          )}
        </div>
        {versionData && (
          <div className="package-stats">
            {versionData && (
              <div className="package-registry">
                <CheckCircle2 className="package-icon" />
                <a
                  target="_blank"
                  href={`https://registry.bazel.build/modules/${module.name}`}
                >
                  Bazel central registry
                </a>
              </div>
            )}
            {versionData && (
              <div className="package-compatability">
                <Milestone className="package-icon" />
                Compatibility level{" "}
                {[
                  ...versionData.module.matchAll(
                    /compatibility_level.*?([0-9]+).*?/g
                  ),
                ]
                  .map((m) => m[1])
                  .find(() => true) || "unknown"}
              </div>
            )}
            {yanked && (
              <div className="package-yanked">
                <AlertOctagon className="package-icon" />
                Yanked because of {yanked}
              </div>
            )}
            {versionData && (
              <div className="package-sha">
                <Lock className="package-icon" />
                {versionData.source.integrity.split("-")[1]}
              </div>
            )}
          </div>
        )}
        {/* todo render repos with multiple modules nicely  */}
        {module && module.maintainers?.length > 0 && (
          <div className="package-stats">
            <div className="package-maintainers">
              <User className="package-icon" />
              Maintained by
              {module.maintainers.map((m, i) => (
                <span key={m.github}>
                  <a target="_blank" href={`https://github.com/${m.github}`}>
                    {m.name}
                  </a>
                  {i < module.maintainers.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="package-footer">
          <div className="package-description">
            {props.data.repo.description}
          </div>
          {(props.data.workspace_snippet || props.data.module_snippet) && (
            <div className="package-buttons">
              {props.data.workspace_snippet && (
                <button
                  className={workspaceCopied ? "copied" : ""}
                  onClick={(e) => {
                    copy(
                      release.workspace_snippet || props.data.workspace_snippet
                    );
                    setWorkspaceCopied(!workspaceCopied);
                  }}
                >
                  <Copy /> {workspaceCopied ? <>Copied!</> : <>Workspace</>}
                </button>
              )}
              {props.data.module_snippet && (
                <button
                  className={moduleCopied ? "copied" : ""}
                  onClick={(e) => {
                    copy(release.module_snippet || props.data.module_snippet);
                    setModuleCopied(!moduleCopied);
                  }}
                >
                  <Copy /> {moduleCopied ? <>Copied!</> : <>Module</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {release &&
        [release].map((release) => (
          <div className="package package-release" key={release.tag_name}>
            <div className="release-header">
              <div className="release-name">{release.tag_name}</div>
              <div className="release-date">
                {new Date(release.published_at).toLocaleDateString("en-us", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="package-release-dropdown-container">
                <select
                  className="package-release-dropdown"
                  onChange={(e) =>
                    history.push(
                      `${location.pathname
                        .split("@")[0]
                        .replace(/\/$/, "")}@${e.target.value.replace(
                        /^v/,
                        ""
                      )}`
                    )
                  }
                  value={getVersion(location)}
                >
                  {props.data.releases.map((r) => (
                    <option
                      key={r.tag_name}
                      value={r.tag_name.replace(/^v/, "")}
                    >
                      {r.tag_name.replace(/^v/, "")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className="package-rendered"
              dangerouslySetInnerHTML={{
                __html: release.body.replace(
                  new RegExp(
                    `<h1.*?>.*?${release.name.replace(
                      /[-[\]{}()*+?.,\\^$|#\s]/g,
                      "\\$&"
                    )}.*?</h1>`
                  ),
                  ""
                ),
              }}
            />
            {
              <>
                {versionData && (
                  <div className="package-deps">
                    <b>Deps:</b>
                    <ul>
                      {[
                        ...versionData.module.matchAll(
                          /bazel_dep\(.*?name.*?=.*?\"(.*?)\".*?version.*?=.*?\"(.*?)\".*?\)/g
                        ),
                      ].map((m) => (
                        <li key={m[1]}>
                          <Link href={`/bazel/${m[1]}`}>{m[1]}</Link> · version{" "}
                          {m[2]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {release && release.assets.length > 0 && (
                  <div className="package-assets">
                    <b>Assets:</b>
                    <ul>
                      {release.assets.map((a) => (
                        <li key={a.name}>
                          <a href={a.browser_download_url}>{a.name}</a> ·{" "}
                          {size(a.size)} · {a.download_count.toLocaleString()}{" "}
                          downloads
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {versionData && versionData.patches.length > 0 && (
                  <div className="package-time">
                    Patches:
                    {Object.keys(versionData.patches).map((p) => (
                      <div key={p}>{p}</div>
                    ))}
                  </div>
                )}
              </>
            }
          </div>
        ))}
      {
        <div className="package">
          <div
            className="package-rendered"
            dangerouslySetInnerHTML={{
              __html: props.data.root.readme
                .replaceAll(
                  `href="`,
                  `href="https://github.com/${props.data.repo.full_name}/blob/${props.data.repo.default_branch}/`
                )
                .replaceAll(
                  `href="https://github.com/${props.data.repo.full_name}/blob/${props.data.repo.default_branch}/#`,
                  `href="#user-content-`
                )
                .replaceAll(
                  `href="https://github.com/${props.data.repo.full_name}/blob/${props.data.repo.default_branch}/https://`,
                  `href="https://`
                )
                .replaceAll(
                  `href="https://github.com/${props.data.repo.full_name}/blob/${props.data.repo.default_branch}/http://`,
                  `href="http://`
                ),
            }}
          />
        </div>
      }
    </div>
  );
};

function copy(snippet) {
  var input = document.createElement("textarea");
  input.value = snippet;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

function getVersion(location) {
  let parts = location.pathname.split("@");
  if (parts.length <= 1) {
    return "";
  }
  return parts[1].replaceAll("/", "");
}

function getReleaseForTag(releases, tag) {
  for (let release of releases) {
    if (release.tag_name.replace(/^v/, "") == tag) {
      return release;
    }
  }
  return releases[0];
}

export default Module;
