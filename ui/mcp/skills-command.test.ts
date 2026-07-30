import { CONTRIBUTOR_SKILLS, isContributorSkill, planSkills, skillName } from './skills-command';

const PACKAGE_SKILLS = [
  'nativectx-components.md',
  'nativectx-contributing.md',
  'nativectx-dev.md',
  'nativectx-mcp.md',
  'nativectx-migration.md',
  'nativectx-navigation.md',
  'nativectx-setup.md',
  'nativectx-theme.md',
];

const CONSUMER_FILES = [
  'nativectx-components.md',
  'nativectx-mcp.md',
  'nativectx-migration.md',
  'nativectx-navigation.md',
  'nativectx-setup.md',
  'nativectx-theme.md',
];

const CONTRIBUTOR_FILES = ['nativectx-contributing.md', 'nativectx-dev.md'];

describe('skillName guard', () => {
  it('accepts the exact skill filename shape', () => {
    expect(skillName('nativectx-setup.md')).toBe('setup');
    expect(skillName('nativectx-contributing.md')).toBe('contributing');
  });

  it('rejects sync-conflict copies', () => {
    expect(skillName('nativectx-setup 2.md')).toBeNull();
    expect(skillName('nativectx-dev 2.md')).toBeNull();
    expect(skillName('nativectx-setup copy.md')).toBeNull();
    expect(skillName('nativectx-setup-2.md')).toBeNull();
  });

  it('rejects files this package does not own', () => {
    expect(skillName('zero-to-app-setup.md')).toBeNull();
    expect(skillName('my-project-notes.md')).toBeNull();
    expect(skillName('nativectx-setup.txt')).toBeNull();
    expect(skillName('README.md')).toBeNull();
  });
});

describe('audience mapping', () => {
  it('marks only the library-development skills as contributor', () => {
    expect(CONTRIBUTOR_SKILLS).toEqual(['dev', 'contributing']);
    expect(isContributorSkill('dev')).toBe(true);
    expect(isContributorSkill('contributing')).toBe(true);
    expect(isContributorSkill('setup')).toBe(false);
    expect(isContributorSkill('components')).toBe(false);
  });
});

describe('planSkills partitioning', () => {
  it('installs only app-building skills by default', () => {
    const plan = planSkills(PACKAGE_SKILLS, []);
    expect(plan.install).toEqual(CONSUMER_FILES);
    expect(plan.install).toHaveLength(6);
    expect(plan.heldBack).toEqual(CONTRIBUTOR_FILES);
  });

  it('installs everything in contributor mode', () => {
    const plan = planSkills(PACKAGE_SKILLS, [], { contributor: true });
    expect(plan.install).toEqual(PACKAGE_SKILLS);
    expect(plan.install).toHaveLength(8);
    expect(plan.heldBack).toEqual([]);
  });

  it('never installs sync-conflict copies in either mode', () => {
    const messy = [...PACKAGE_SKILLS, 'nativectx-setup 2.md', 'nativectx-dev 2.md', 'notes.md'];
    expect(planSkills(messy, []).install).toEqual(CONSUMER_FILES);
    expect(planSkills(messy, [], { contributor: true }).install).toEqual(PACKAGE_SKILLS);
  });
});

describe('planSkills prune', () => {
  it('removes contributor skills left by an earlier install', () => {
    const plan = planSkills(PACKAGE_SKILLS, [...CONSUMER_FILES, ...CONTRIBUTOR_FILES]);
    expect(plan.prune).toEqual(CONTRIBUTOR_FILES);
  });

  it('never prunes in contributor mode', () => {
    const plan = planSkills(PACKAGE_SKILLS, [...CONSUMER_FILES, ...CONTRIBUTOR_FILES], {
      contributor: true,
    });
    expect(plan.prune).toEqual([]);
  });

  it('leaves files this package does not own alone', () => {
    const dest = [
      ...CONTRIBUTOR_FILES,
      'my-own-dev.md',
      'contributing.md',
      'nativectx-dev 2.md',
      'zero-to-app-dev.md',
      'team-conventions.md',
    ];
    expect(planSkills(PACKAGE_SKILLS, dest).prune).toEqual(CONTRIBUTOR_FILES);
  });

  it('is a no-op on a second consumer run', () => {
    const first = planSkills(PACKAGE_SKILLS, [...CONSUMER_FILES, ...CONTRIBUTOR_FILES]);
    const afterFirst = [...CONSUMER_FILES, ...CONTRIBUTOR_FILES].filter(
      (file) => !first.prune.includes(file),
    );
    expect(planSkills(PACKAGE_SKILLS, afterFirst).prune).toEqual([]);
  });

  it('is a no-op on a second contributor run', () => {
    const dest = [...CONSUMER_FILES, ...CONTRIBUTOR_FILES];
    expect(planSkills(PACKAGE_SKILLS, dest, { contributor: true }).prune).toEqual([]);
  });

  it('prunes a contributor skill even if the package no longer ships it', () => {
    expect(planSkills(CONSUMER_FILES, [...CONSUMER_FILES, 'nativectx-dev.md']).prune).toEqual([
      'nativectx-dev.md',
    ]);
  });
});
