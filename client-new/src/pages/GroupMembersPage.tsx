import React from 'react';
import { useParams } from 'react-router-dom';
import { GroupMembers } from '../components/groups/GroupMembers';

export const GroupMembersPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();

  if (!groupId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Invalid Group</h1>
        <p>Group ID is required to view members.</p>
      </div>
    );
  }

  return <GroupMembers groupId={groupId} />;
};